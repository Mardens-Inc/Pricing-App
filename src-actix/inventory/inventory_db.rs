use crate::mysql_row_wrapper::MySqlRowWrapper;
use anyhow::Result;
use csv::WriterBuilder;
use database_common_lib::database_connection::{create_pool, DatabaseConnectionData};
use serde_derive::{Deserialize, Serialize};
use sqlx::{Column, Executor, MySqlPool, Row};

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
                    params.push(format!("%{}%", query_value));
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


/// Adds a new record to the specified table.
///
/// # Arguments
///
/// - `id`: The ID of the table where the record will be added.
/// - `record`: A JSON object representing the data to insert.
/// - `data`: The database connection data.
///
/// # Returns
///
/// A `Result` wrapping the ID of the newly inserted record.
pub async fn add_record(
    id: u64,
    record: &serde_json::Value,
    data: &DatabaseConnectionData,
) -> Result<u64> {
    let pool = create_pool(data).await?;

    // Build the base insert query
    let mut query = format!("INSERT INTO `{}` ", id);
    let mut columns = Vec::new();
    let mut values_placeholders = Vec::new();
    let mut params = Vec::new();

    // Dynamically construct the columns and values for the insert
    if let Some(obj) = record.as_object() {
        for (column, value) in obj {
            columns.push(format!("`{}`", column));
            values_placeholders.push("?");
            if let Some(str_value) = value.as_str() {
                params.push(str_value.to_string());
            } else {
                params.push(value.to_string());
            }
        }
    }

    // Combine the query parts
    query.push_str(&format!(
        "({}) VALUES ({})",
        columns.join(", "),
        values_placeholders.join(", ")
    ));

    // Prepare the query
    let mut sql_query = sqlx::query(&query);

    // Bind all parameters dynamically
    for param in params {
        sql_query = sql_query.bind(param);
    }

    // Execute the query
    let result = sql_query.execute(&pool).await?;

    // Return the ID of the newly inserted record
    Ok(result.last_insert_id())
}


pub async fn get_record(
    id: u64,
    record_id: u64,
    data: &DatabaseConnectionData,
) -> Result<Option<serde_json::Value>> {
    let pool = create_pool(data).await?;

    // Prepare the query to fetch a single record by its ID
    let query = format!("SELECT * FROM `{}` WHERE id = ?", id);

    // Execute the query and fetch the record
    let row = sqlx::query(&query)
        .bind(record_id)
        .fetch_optional(&pool)
        .await?;

    // If a record is found, transform it into a JSON value and return
    if let Some(row) = row {
        let record: serde_json::Value = serde_json::json!(MySqlRowWrapper(row));
        Ok(Some(record))
    } else {
        // If no record is found, return None
        Ok(None)
    }
}


pub async fn update_record(
    id: u64,
    record_id: u64,
    updates: &serde_json::Value,
    data: &DatabaseConnectionData,
) -> Result<()> {
    let pool = create_pool(data).await?;

    // Build the base update query
    let mut query = format!("UPDATE `{}` SET ", id);
    let mut params = Vec::new();

    // Dynamically construct the columns and their values for the update
    if let Some(obj) = updates.as_object() {
        for (column, value) in obj {
            query.push_str(&format!("`{}` = ?, ", column));
            if let Some(str_value) = value.as_str() {
                params.push(str_value.to_string());
            } else {
                params.push(value.to_string());
            }
        }
    }

    // Remove the last comma and space, and add the WHERE clause
    query.pop();
    query.pop();
    query.push_str(" WHERE id = ?");
    params.push(record_id.to_string());

    // Prepare the query
    let mut sql_query = sqlx::query(&query);

    // Bind all parameters dynamically
    for param in params {
        sql_query = sql_query.bind(param);
    }

    // Execute the query
    sql_query.execute(&pool).await?;
    Ok(())
}

pub async fn delete(id: u64, data: &DatabaseConnectionData) -> Result<()> {
    let pool = create_pool(data).await?;
    delete_with_connection(id, &pool).await
}

pub async fn delete_with_connection(id: u64, pool: &MySqlPool) -> Result<()> {
    pool.execute(format!("DROP TABLE FROM {}", id).as_str())
        .await?;
    Ok(())
}

pub async fn export_csv(id: u64, data: &DatabaseConnectionData) -> Result<String> {
    let pool = create_pool(data).await?;

    // Use CSV Writer to write into the in-memory string
    let mut writer = WriterBuilder::new().from_writer(vec![]);

    // Query the database and fetch all rows
    let rows = pool
        .fetch_all(format!("SELECT * FROM `{}`", id).as_str())
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
