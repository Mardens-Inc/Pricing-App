mod table_name_migration_tool;

use database_common_lib::database_connection::{create_pool, DatabaseConnectionData};
use log::{debug, info, warn};
use pricing_app_lib::columns_data::InventoryColumn;
use pricing_app_lib::columns_db;
use serde::{Deserialize, Serialize};
use sqlx::{MySqlPool, Row};
use std::collections::HashMap;
use std::error::Error;

/// Struct representing the old options format for migration.
#[derive(Debug, Serialize, Deserialize)]
struct OldOptions {
    /// Collection of columns with associated properties.
    columns: Vec<Column>,
}

/// Struct representing a column in the database.
#[derive(Debug, Serialize, Deserialize)]
struct Column {
    /// Display name of the column.
    name: String,
    /// Visibility flag for the column.
    visible: bool,
    #[serde(rename = "real_name")]
    /// Actual database column name.
    real_name: String,
    /// Additional attributes associated with the column.
    attributes: Vec<String>,
}

/// Main entry point of the program.
/// Initializes logging, retrieves database connection data, and migrates options.
///
/// # Returns
/// - `Ok(())` if successful.
/// - `Err(Box<dyn Error>)` if an error occurs.
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Set the log level and initialize the logger.
    std::env::set_var("RUST_LOG", "info");
    env_logger::init();

    info!("Starting options migration tool");
    warn!("This tool will clear all existing data in the columns_db schema!");
    tokio::time::sleep(std::time::Duration::from_secs(5)).await;

    // Get database connection data.
    let data = DatabaseConnectionData::get().await?;

    // Initialize the 'columns_db' schema if it doesn't already exist.
    columns_db::initialize(&data).await?;

    // Create a pool for connecting to the database.
    let pool = create_pool(&data).await?;

    // clear any data inside the inventory columns table
    sqlx::query("truncate table inventory_columns")
        .execute(&pool)
        .await?;

    // Retrieve options for the specified location.
    let options = get_location_options(&pool).await?;

    info!("Inserting columns");

    // Insert columns for each location into the database.
    for (id, options) in options {
        info!("Inserting columns for location {}", id);

        // Process each column in the options.
        for column in options.columns {
            debug!("Inserting column {}", column.name);

            InventoryColumn::insert(
                &data,
                column.real_name,
                Some(column.name),
                column.visible,
                Some(column.attributes.join(",")), // Serialize attributes as a comma-separated string.
                id,
            )
            .await?;
        }
    }

    info!("Done inserting columns");
    info!("Done!");
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
async fn get_location_options(
    pool: &MySqlPool,
) -> Result<HashMap<u64, OldOptions>, Box<dyn Error>> {
    info!("Getting old location options");

    // Query the 'locations' table for old options based on the location ID.
    let rows = sqlx::query(r#"select id,options from locations"#)
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
