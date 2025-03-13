use database_common_lib::database_connection::{create_pool, DatabaseConnectionData};
use log::*;
use serde_json::Value;
use sqlx::MySqlPool;
use anyhow::Result;

#[derive(Debug)]
struct HashIdMap {
    id: u64,
    hash: String,
}

#[tokio::main]
/// Main function that performs a table renaming operation in a MySQL database.
///
/// # Steps:
/// 1. Initializes logging and fetches database connection data.
/// 2. Fetches a list of locations from an external API and transforms it into a `HashIdMap`.
/// 3. Connects to the database using the provided credentials.
/// 4. Renames tables in the database using the data from the API.
///
/// # Returns:
/// * `Ok(())` on success.
/// * `Err(Box<dyn Error>)` if any step fails.
///
/// # Errors:
/// * Fails if the API request for locations fails, or if the response is invalid.
/// * Errors during database connection or queries will also result in failure.
///
/// # Panics:
/// This function does not handle panics explicitly, but will propagate any unexpected runtime errors.
///
async fn main() -> Result<()> {
    // Set the log level to "info" to control logging verbosity.
    std::env::set_var("RUST_LOG", "info");

    // Initialize the logger.
    env_logger::init();
    info!("Starting table name migration tool");

    // Fetch database connection data from a remote configuration endpoint.
    let data = DatabaseConnectionData::get().await?;

    // Fetch all locations from the Pricing API.
    let locations: Vec<Value> = reqwest::get("https://pricing-new.mardens.com/api/locations/all")
        .await?
        .json()
        .await?;

    // Create a vector to store the mapping of hash (table name) to id (new table name).
    let mut hash_id_map: Vec<HashIdMap> = vec![];

    // Process each location object to extract `id` and `unhashed_id` fields.
    for location in locations {
        if let Some(hash) = location["id"].as_str() {
            if let Some(id) = location["unhashed_id"].as_str() {
                if let Ok(id) = id.parse::<u64>() {
                    // Add the mapping to the hash_id_map vector if both fields exist and are valid.
                    hash_id_map.push(HashIdMap {
                        id,
                        hash: hash.to_string(),
                    });
                }
            }
        }
    }

    // Establish a connection pool for the MySQL database.
    let pool: MySqlPool = create_pool(&data).await?;

    // Iterate over the mappings and execute SQL rename queries for each table.
    for hash_id_map in hash_id_map {
        sqlx::query(
            format!(
                "RENAME TABLE `{}` to `{}`",
                hash_id_map.hash, hash_id_map.id
            )
            .as_str(),
        )
        .execute(&pool)
        .await?;
    }

    // Log the successful completion of the process.
    info!("Done!");
    Ok(())
}
