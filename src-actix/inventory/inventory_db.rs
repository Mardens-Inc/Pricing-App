use crate::data_database_connection::DatabaseConnectionData;
use csv::WriterBuilder;
use log::debug;
use sqlx::{Column, Executor, MySqlPool, Row};
use std::collections::HashMap;
use std::error::Error;

async fn create_pool(data: &DatabaseConnectionData) -> Result<MySqlPool, Box<dyn Error>> {
    debug!("Creating MySQL production connection");
    let pool = MySqlPool::connect(&format!(
        "mysql://{}:{}@{}/pricing",
        data.user, data.password, data.host
    ))
    .await?;
    Ok(pool)
}

pub async fn export_csv(
    id: impl AsRef<str>,
    data: &DatabaseConnectionData,
) -> Result<String, Box<dyn Error>> {
    let id = id.as_ref();
    let pool = create_pool(data).await?;

    // Use CSV Writer to write into the in-memory string
    let mut writer = WriterBuilder::new().from_writer(vec![]);

    // Query the database and fetch all rows
    let rows = pool
        .fetch_all(format!("SELECT * FROM {}", id).as_str())
        .await?;

    if let Some(first_row) = rows.first() {
        // Write headers
        let headers: Vec<String> = first_row
            .columns()
            .iter()
            .map(|column| column.name().to_string())
            .collect();
        writer.write_record(&headers)?;

        // Write rows
        for row in rows {
            let record: Vec<String> = row
                .columns()
                .iter()
                .map(|column| row.try_get::<String, _>(column.name()).unwrap_or_default())
                .collect();
            writer.write_record(&record)?;
        }
    }

    // Convert the CSV writer buffer into a string
    let csv_str = String::from_utf8(writer.into_inner()?)?;

    Ok(csv_str)
}
