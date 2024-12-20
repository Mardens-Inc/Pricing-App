use log::debug;
use log::error;
use pricing_app::data_database_connection::DatabaseConnectionData;
use sqlx::{MySqlPool, Row};
use std::error::Error;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
struct OldOptions {
    columns: Vec<Column>,
    #[serde(rename = "print-form")]
    print_form: PrintForm,
    #[serde(rename = "voice-search")]
    voice_search: bool,
    #[serde(rename = "mardens-price")]
    mardens_price: Vec<MardensPrice>,
    #[serde(rename = "add-if-missing")]
    add_if_missing: bool,
    #[serde(rename = "remove-if-zero")]
    remove_if_zero: bool,
    #[serde(rename = "allow-additions")]
    allow_additions: bool,
    #[serde(rename = "allow-inventorying")]
    allow_inventorying: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct Column {
    name: String,
    visible: bool,
    #[serde(rename = "real_name")]
    real_name: String,
    attributes: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct PrintForm {
    label: String,
    enabled: bool,
    sticker: Sticker,
}

#[derive(Debug, Serialize, Deserialize)]
struct Sticker {
    name: String,
    width: f64,
    height: f64,
}

#[derive(Debug, Serialize, Deserialize)]
struct MardensPrice {
    column: String,
    percent: i32,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let data = DatabaseConnectionData::get().await?;
    let pool = create_pool(&data).await?;
    let location_id = 6;
    let options = get_location_options(location_id, &pool).await?;
    println!("{:#?}", options);

    Ok(())
}

async fn get_location_options(
    location_id: u64,
    pool: &MySqlPool,
) -> Result<OldOptions, Box<dyn Error>> {
    let row = sqlx::query(r#"select options from locations where id = ? limit 1"#)
        .bind(&location_id)
        .fetch_one(pool)
        .await?;
    let result: Value = row.try_get("options")?;
    let options: OldOptions = serde_json::from_value(result)?;
    Ok(options)
}

async fn create_pool(data: &DatabaseConnectionData) -> Result<MySqlPool, Box<dyn Error>> {
    debug!("Creating MySQL production connection");
    let pool = MySqlPool::connect(&format!(
        "mysql://{}:{}@{}/pricing",
        data.user, data.password, data.host
    ))
    .await?;
    Ok(pool)
}
