use crate::data_database_connection::{create_pool, DatabaseConnectionData};
use crate::mysql_row_wrapper::MySqlRowWrapper;
use anyhow::Result;
use csv::WriterBuilder;
use log::debug;
use serde_derive::{Deserialize, Serialize};
use sqlx::{Column, Executor, Row};

#[derive(Deserialize)]
pub struct InventoryFilterOptions {
    query: Option<String>,
    query_columns: Option<String>,
    limit: Option<u64>,
    offset: Option<u64>,
    sort_by: Option<String>,
    sort_order: Option<String>,
}

#[derive(Serialize)]
pub struct InventoryResult {
    data: Vec<serde_json::Value>,
    total: Option<u64>,
}

pub async fn get_inventory(
    id: u64,
    options: Option<InventoryFilterOptions>,
    data: &DatabaseConnectionData,
) -> Result<InventoryResult> {
    // Create the database connection pool
    let pool = create_pool(data).await?;

    let mut result = Vec::new();
    let mut query = format!("SELECT *, COUNT(*) OVER () AS total_records FROM `{}`", id);
    let mut conditions = Vec::new();
    let mut params = Vec::new(); // Collect parameters for binding

    // Process options to dynamically build the query and bind parameters
    if let Some(options) = options {
        if let Some(query_value) = options.query {
            if let Some(query_columns) = options.query_columns {
                for column in query_columns.split(',') {
                    conditions.push(format!("`{}` like ?", column.trim()));
                    params.push(query_value.to_string());
                }
            }
        }

        if !conditions.is_empty() {
            query.push_str(" WHERE ");
            query.push_str(&conditions.join(" OR "));
        }

        if let Some(sort_by) = options.sort_by {
            query.push_str(" ORDER BY ");
            query.push_str(&format!(
                "`{}` {}",
                sort_by.trim(),
                options.sort_order.unwrap_or_else(|| "ASC".to_string())
            ));
        }

        if let Some(limit) = options.limit {
            query.push_str(" LIMIT ?");
            params.push(limit.to_string());
        }

        if let Some(offset) = options.offset {
            query.push_str(" OFFSET ?");
            params.push(offset.to_string());
        }
    }

    // Prepare the query with parameters
    let mut sql_query = sqlx::query(&query);

    // Bind all parameters dynamically
    for param in params {
        sql_query = sql_query.bind(param);
    }

    // Execute the query and fetch rows
    let rows = sql_query.fetch_all(&pool).await?;

    // Process rows into JSON results
    let mut total: Option<u64> = None;
    for row in rows {
        debug!("Row Data: {:?}", row);
        if total.is_none() {
            total = row.try_get("total_records").ok();
        }
        // Remove the `total_records` column from the row
        let mut row_json = serde_json::json!(MySqlRowWrapper(row));
        if let Some(obj) = row_json.as_object_mut() {
            obj.remove("total_records");
        }
        result.push(row_json);
    }

    Ok(InventoryResult {
        data: result,
        total,
    })
}

pub async fn export_csv(id: u64, data: &DatabaseConnectionData) -> Result<String> {
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

pub async fn count(id: u64, data: &DatabaseConnectionData) -> Result<u64> {
    let pool = create_pool(data).await?;
    let result = sqlx::query(r#"select count(*) from ?"#)
        .bind(id)
        .fetch_one(&pool)
        .await?;
    Ok(result.try_get("count")?)
}
