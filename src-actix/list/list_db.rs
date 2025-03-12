use crate::list_data::LocationListItem;
use anyhow::Result;
use database_common_lib::database_connection::{create_pool, DatabaseConnectionData};
use sqlx::{Executor, MySqlPool};

pub async fn initialize(pool: &MySqlPool) -> Result<()> {
    pool.execute(
        r#"
CREATE TABLE if NOT EXISTS locations
(
    id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    NAME      VARCHAR(255)                        NOT NULL,
    location  VARCHAR(255)                        NOT NULL,
    po        VARCHAR(255)                        NOT NULL,
    image     VARCHAR(255)                        NOT NULL,
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
		"#,
    )
    .await?;

    Ok(())
}

pub async fn get_all(data: &DatabaseConnectionData) -> Result<Vec<LocationListItem>> {
    let pool = create_pool(data).await?;
    let locations = sqlx::query_as::<_, LocationListItem>(
        r#"
		SELECT * FROM locations ORDER BY post_date DESC
		"#,
    )
    .fetch_all(&pool)
    .await?;

    Ok(locations)
}

pub async fn single(id: u64, data: &DatabaseConnectionData) -> Result<LocationListItem> {
    let pool = create_pool(data).await?;
    let location =
        sqlx::query_as::<_, LocationListItem>(r#"SELECT * FROM locations WHERE id = ? limit 1"#)
            .bind(id)
            .fetch_one(&pool)
            .await?;

    Ok(location)
}

pub async fn insert(location: &LocationListItem, data: &DatabaseConnectionData) -> Result<()> {
    let pool = create_pool(data).await?;
    sqlx::query(
        r#"
		INSERT INTO locations (name, location, po, image)
		VALUES (?, ?, ?, ?)
		"#,
    )
    .bind(&location.name)
    .bind(&location.location)
    .bind(&location.po)
    .bind(&location.image)
    .execute(&pool)
    .await?;
    Ok(())
}

pub async fn delete(id: u64, data: &DatabaseConnectionData) -> Result<()> {
    delete_with_connection(id, &create_pool(data).await?).await
}

pub async fn delete_with_connection(id: u64, pool: &MySqlPool) -> Result<()> {
    sqlx::query(
        r#"
		DELETE FROM locations
		WHERE id = ?
		"#,
    )
    .bind(id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn update(
    id: u64,
    location: &LocationListItem,
    data: &DatabaseConnectionData,
) -> Result<()> {
    let pool = create_pool(data).await?;
    sqlx::query(r#"UPDATE locations SET name = ?, location = ?, po = ?, image = ? WHERE id = ?"#)
        .bind(&location.name)
        .bind(&location.location)
        .bind(&location.po)
        .bind(&location.image)
        .bind(id)
        .execute(&pool)
        .await?;

    Ok(())
}
