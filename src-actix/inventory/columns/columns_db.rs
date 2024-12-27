use crate::columns_data::InventoryColumn;
use crate::data_database_connection::DatabaseConnectionData;
use log::debug;
use sqlx::{Executor, MySqlPool};
use std::error::Error;
use std::path::Display;

pub async fn initialize(data: &DatabaseConnectionData) -> Result<(), Box<dyn Error>> {
    let pool = create_pool(data).await?;
    pool.execute(
        r#"
CREATE TABLE IF NOT EXISTS `inventory_columns`
(
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NULL DEFAULT NULL,
    visible      BOOL              DEFAULT TRUE,
    attributes   TEXT              DEFAULT NULL,
    database_id  BIGINT UNSIGNED
);
	"#,
    )
    .await?;

    Ok(())
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

pub async fn get_columns(
    location_id: u64,
    data: &DatabaseConnectionData,
) -> Result<Vec<InventoryColumn>, Box<dyn Error>> {
    let pool = create_pool(data).await?;
    let columns = sqlx::query_as::<_, InventoryColumn>(
        "select * from inventory_columns where database_id = ?",
    )
    .bind(location_id)
    .fetch_all(&pool)
    .await?;

    Ok(columns)
}

pub async fn insert_column(
    name: impl AsRef<str>,
    display_name: impl AsRef<str>,
    visible: bool,
    attributes: impl AsRef<str>,
    database_id: u64,
) -> Result<(), Box<dyn Error>> {
    let name = name.as_ref();
    let display_name = display_name.as_ref();
    let attributes = attributes.as_ref();

    let pool = create_pool(&DatabaseConnectionData::get().await?).await?;
    let result = sqlx::query(
        r#"
        INSERT INTO inventory_columns (name, display_name, visible, attributes, database_id)
        VALUES (?, ?, ?, ?, ?);
    "#,
    )
    .bind(name)
    .bind(display_name)
    .bind(visible)
    .bind(attributes)
    .bind(database_id)
    .execute(&pool)
    .await?;

    Ok(())
}

pub async fn set_display_name(
    location_id: u64,
    name: impl AsRef<str>,
    display_name: impl AsRef<str>,
    data: &DatabaseConnectionData,
) -> Result<(), Box<dyn Error>> {
    let name = name.as_ref();
    let display_name = display_name.as_ref();
    let pool = create_pool(data).await?;

    sqlx::query(
        r#"
        UPDATE inventory_columns SET display_name = ? WHERE name = ? AND database_id = ? LIMIT 1;
    "#,
    )
    .bind(display_name)
    .bind(name)
    .bind(location_id)
    .execute(&pool)
    .await?;

    Ok(())
}

pub async fn set_visibility(
    location_id: u64,
    name: impl AsRef<str>,
    visible: bool,
    data: &DatabaseConnectionData,
) -> Result<(), Box<dyn Error>> {
    let name = name.as_ref();
    let pool = create_pool(data).await?;

    sqlx::query(
        r#"
        UPDATE inventory_columns SET visible = ? WHERE name = ? AND database_id = ? LIMIT 1;
        "#,
    )
    .bind(visible)
    .bind(name)
    .bind(location_id)
    .execute(&pool)
    .await?;

    Ok(())
}

pub async fn set_attributes(
    location_id: u64,
    name: impl AsRef<str>,
    attributes: impl AsRef<str>,
    data: &DatabaseConnectionData,
) -> Result<(), Box<dyn Error>> {
    let name = name.as_ref();
    let pool = create_pool(data).await?;

    let attributes = attributes.as_ref();

    sqlx::query(
        r#"
        UPDATE inventory_columns
        SET attributes = ?
        WHERE name = ? AND database_id = ? LIMIT 1;
        "#,
    )
    .bind(attributes)
    .bind(name)
    .bind(location_id)
    .execute(&pool)
    .await?;

    Ok(())
}
