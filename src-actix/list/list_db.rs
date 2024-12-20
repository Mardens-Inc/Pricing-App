use crate::data_database_connection::DatabaseConnectionData;
use crate::list_data::LocationListItem;
use log::debug;
use sqlx::MySqlPool;
use std::error::Error;

pub async fn initialize(data: &DatabaseConnectionData) -> Result<(), Box<dyn Error>> {
    let pool = create_pool(data).await?;
    sqlx::query(
        r#"
CREATE TABLE IF NOT EXISTS locations
(
    id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(255)                        NOT NULL,
    location  VARCHAR(255)                        NOT NULL,
    po        VARCHAR(255)                        NOT NULL,
    image     VARCHAR(255)                        NOT NULL,
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
		"#,
    )
    .execute(&pool)
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

pub async fn get_all(
    data: &DatabaseConnectionData,
) -> Result<Vec<LocationListItem>, Box<dyn Error>> {
    let pool = create_pool(data).await?;
    let locations = sqlx::query_as::<_, LocationListItem>(
        r#"
		select * from locations order by post_date desc
		"#,
    )
    .fetch_all(&pool)
    .await?;

    Ok(locations)
}

pub async fn insert(
    location: &LocationListItem,
    data: &DatabaseConnectionData,
) -> Result<(), Box<dyn Error>> {
    let pool = create_pool(data).await?;
    sqlx::query(
        r#"
		insert into locations (name, location, po, image)
		values (?, ?, ?, ?)
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

pub async fn delete(id: u64, data: &DatabaseConnectionData) -> Result<(), Box<dyn Error>> {
    let pool = create_pool(data).await?;
    sqlx::query(
        r#"
		delete from locations
		where id = ?
		"#,
    )
    .bind(id)
    .execute(&pool)
    .await?;
    Ok(())
}
