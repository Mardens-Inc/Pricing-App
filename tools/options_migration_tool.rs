use anyhow::Result;
use log::*;
use pricing_app_lib::data_database_connection::DatabaseConnectionData;
use pricing_app_lib::options_data;
use pricing_app_lib::options_data::{InventoryOptions, Inventorying};
use serde_derive::{Deserialize, Serialize};
use sqlx::{MySqlPool, Row};
use std::collections::HashMap;
use log::__private_api::enabled;

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Serialize, Deserialize, Debug)]
struct Sticker {
    // Sticker properties
    name: String,
    width: f64,
    height: f64,
}

#[derive(Serialize, Deserialize, Debug)]
struct PrintForm {
    label: Option<String>,
    enabled: Option<bool>,
    sticker: Option<Sticker>,
    year: Option<u8>,
    #[serde(rename = "show-price")]
    show_retail: Option<bool>,
    #[serde(rename = "show-price-label")]
    show_price_label: Option<bool>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Set the logging level and initialize the logger
    std::env::set_var("RUST_LOG", "debug");
    env_logger::init();
    info!("Starting options migration tool");
    warn!("This tool may take a while to run");
    let data = DatabaseConnectionData::get().await?;
    pricing_app_lib::options_db::initialize(&data).await?;
    let pool = create_pool(&data).await?;
    sqlx::query("TRUNCATE TABLE inventory_options")
        .execute(&pool)
        .await?;
    let options = get_location_options(&pool).await?;
    for (id, options) in options {
        let mut print_form: Option<options_data::PrintForm> = None;
        let mut inventorying: Option<Inventorying> = None;

        if let Some(enabled) = options.print_form.enabled {
            if enabled {
                print_form = Some(options_data::PrintForm {
                    year: None,
                    label: Some(options.print_form.label.unwrap_or("".to_string())),
                    show_retail: options.print_form.show_retail.unwrap_or(false),
                    show_price_label: options.print_form.show_price_label.unwrap_or(false),
                });
            }
        }
	    
	    

        let new_option = InventoryOptions {
            print_form,
            inventorying: Some(Inventorying {
                allow_additions: options.allow_additions,
                remove_if_zero: options.remove_if_zero,
                add_if_missing: options.add_if_missing,
            }),
        };
    }

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
        debug!("Processing id {}", id);

        // Deserialize the options field into the OldOptions struct.
        let options: OldOptions = serde_json::from_value(row.try_get("options")?)?;

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
