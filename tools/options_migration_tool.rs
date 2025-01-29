use anyhow::Result;
use log::*;
use pricing_app_lib::data_database_connection::DatabaseConnectionData;
use pricing_app_lib::options_data::{InventoryOptions, Inventorying};
use pricing_app_lib::{options_db, print_options_data};
use serde::de::{Error, Visitor};
use serde::{de, Deserializer};
use serde_derive::Deserialize;
use sqlx::{MySqlPool, Row};
use std::collections::HashMap;
use std::fmt;
use std::fmt::Write;

#[derive(Deserialize)]
struct OldOptions {
    #[serde(rename = "print-form")]
    print_form: PrintForm,
    #[serde(rename = "add-if-missing")]
    add_if_missing: bool,
    #[serde(rename = "remove-if-zero")]
    remove_if_zero: bool,
    #[serde(rename = "allow-additions")]
    allow_additions: bool,
    #[serde(rename = "allow-inventorying")]
    allow_inventorying: bool,
}

#[derive(Deserialize)]
struct Sticker {
    // Sticker properties
    width: f64,
    height: f64,
}

#[derive(Deserialize)]
struct PrintForm {
    label: Option<String>,
    #[serde(default, deserialize_with = "deserialize_bool")]
    enabled: Option<bool>,
    sticker: Option<Sticker>,
    #[serde(default, deserialize_with = "deserialize_year")]
    year: Option<u8>,
    department: Option<Department>,
    color: Option<String>,
    #[serde(default, rename = "show-price", deserialize_with = "deserialize_bool")]
    show_retail: Option<bool>,
    #[serde(
        default,
        rename = "show-price-label",
        deserialize_with = "deserialize_bool"
    )]
    show_price_label: Option<bool>,
    #[serde(
        default,
        rename = "show-year-dropdown",
        deserialize_with = "deserialize_bool"
    )]
    show_year_input: Option<bool>,
    #[serde(
        default,
        rename = "show-color-dropdown",
        deserialize_with = "deserialize_bool"
    )]
    show_color_dropdown: Option<bool>,
}

#[derive(Deserialize)]
struct Department {
    id: i8,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Set the logging level and initialize the logger
    std::env::set_var("RUST_LOG", "debug");
    env_logger::init();
    info!("Starting options migration tool");
    warn!("This tool may take a while to run");
    let data = DatabaseConnectionData::get().await?;
    let pool = create_pool(&data).await?;
    options_db::initialize(&pool).await?;
    sqlx::query("TRUNCATE TABLE inventory_options")
        .execute(&pool)
        .await?;
    sqlx::query("TRUNCATE TABLE inventory_print_options")
        .execute(&pool)
        .await?;
    let options = get_location_options(&pool).await?;
    for (id, options) in options {
        let mut print_form: Option<Vec<print_options_data::PrintForm>> = None;

        if let Some(enabled) = options.print_form.enabled {
            if enabled {
                print_form = Some(vec![print_options_data::PrintForm {
                    id: None,
                    hint: None,
                    label: Some(options.print_form.label.unwrap_or("".to_string())),
                    year: options.print_form.year,
                    department: options
                        .print_form
                        .department
                        .map(|d| u8::try_from(d.id).unwrap_or(0)),
                    color: options.print_form.color,
                    size: options
                        .print_form
                        .sticker
                        .map(|s| format!("{}x{}", s.width, s.height)),
                    show_retail: options.print_form.show_retail.unwrap_or(false),
                    show_price_label: options.print_form.show_price_label.unwrap_or(false),
                }]);
            }
        }

        let new_option = InventoryOptions {
            print_form,
            inventorying: Some(Inventorying {
                allow_additions: options.allow_additions,
                remove_if_zero: options.remove_if_zero,
                add_if_missing: options.add_if_missing,
            }),
            show_year_input: options.print_form.show_year_input.unwrap_or(false),
            show_color_dropdown: options.print_form.show_color_dropdown.unwrap_or(false),
        };
        new_option.insert(&data, id).await?;
    }

    pool.close().await;

    Ok(())
}

/// Retrieves location options from the database based on a location ID.
///
/// # Arguments
/// - `location_id` - The ID of the location to retrieve options for.
/// - `pool` - A reference to the MySQL connection pool.
///
/// # Returns
/// - `Ok(HashMap<u64, OldOptions>)` containing location IDs and their corresponding options.
/// - `Err(Box<dyn Error>)` if an error occurs.
async fn get_location_options(pool: &MySqlPool) -> Result<HashMap<u64, OldOptions>> {
    info!("Getting old location options");

    // Query the 'locations' table for old options based on the location ID.
    let rows = sqlx::query(r#"SELECT id,options FROM locations"#)
        .fetch_all(pool)
        .await?;

    // Create a mapping of location IDs to their options.
    let mut map: HashMap<u64, OldOptions> = HashMap::new();

    // Process each row in the result set.
    for row in rows {
        let id: u64 = row.try_get("id")?; // Retrieve the location ID.
        debug!("Fetching Old Options id {}", id);

        // Deserialize the options field into the OldOptions struct.
        let options: OldOptions = serde_json::from_value(row.try_get("options")?).map_err(|e| {
            let options_value: serde_json::Value = row.try_get("options").unwrap_or_else(
                |_| serde_json::json!({"error": "Unable to retrieve 'options' field"}),
            );
            error!(
                "Failed to deserialize options for location ID {}. Options data: {:?}. Error: {}",
                id, options_value, e
            );
            e
        })?;

        // Insert the ID and options into the map.
        map.insert(id, options);
    }

    info!("Done processing old options!");
    Ok(map)
}

/// Creates a MySQL connection pool for the specified database connection data.
///
/// # Arguments
/// - `data` - The database connection data.
///
/// # Returns
/// - `Ok(MySqlPool)` containing the database connection pool.
/// - `Err(Box<dyn Error>)` if an error occurs.
async fn create_pool(data: &DatabaseConnectionData) -> Result<MySqlPool> {
    debug!("Creating MySQL production connection");

    // Construct a formatted connection string and connect to the database.
    let pool = MySqlPool::connect(&format!(
        "mysql://{}:{}@{}/pricing",
        data.user, data.password, data.host
    ))
    .await?;

    Ok(pool)
}

fn deserialize_year<'de, D>(deserializer: D) -> Result<Option<u8>, D::Error>
where
    D: Deserializer<'de>,
{
    struct YearVisitor;

    impl<'de> Visitor<'de> for YearVisitor {
        type Value = Option<u8>;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("an unsigned integer, null, or a string")
        }

        fn visit_u8<E>(self, value: u8) -> Result<Self::Value, E>
        where
            E: Error,
        {
            Ok(Some(value))
        }

        fn visit_str<E>(self, _value: &str) -> Result<Self::Value, E>
        where
            E: Error,
        {
            // Strings are treated as `None`
            Ok(None)
        }

        fn visit_none<E>(self) -> std::result::Result<Self::Value, E>
        where
            E: Error,
        {
            Ok(None)
        }

        fn visit_unit<E>(self) -> Result<Self::Value, E>
        where
            E: Error,
        {
            // Null values are treated as `None`
            Ok(None)
        }
    }

    deserializer.deserialize_any(YearVisitor).or(Ok(None))
}

fn deserialize_bool<'de, D>(deserializer: D) -> Result<Option<bool>, D::Error>
where
    D: Deserializer<'de>,
{
    struct BoolVisitor;
    impl<'de> Visitor<'de> for BoolVisitor {
        type Value = Option<bool>;
        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("a boolean, null, or a string")
        }
        fn visit_bool<E>(self, value: bool) -> Result<Self::Value, E>
        where
            E: Error,
        {
            Ok(Some(value))
        }
        fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
        where
            E: Error,
        {
            match value {
                "true" => Ok(Some(true)),
                "false" => Ok(Some(false)),
                _ => Ok(None),
            }
        }
        fn visit_none<E>(self) -> std::result::Result<Self::Value, E>
        where
            E: Error,
        {
            Ok(None)
        }
        fn visit_unit<E>(self) -> Result<Self::Value, E>
        where
            E: Error,
        {
            Ok(None)
        }
    }
    deserializer.deserialize_any(BoolVisitor).or(Ok(None))
}
