use crate::columns_data::InventoryColumn;
use crate::data_database_connection::{create_pool, DatabaseConnectionData};
use anyhow::Result;
use sqlx::Executor;

pub async fn initialize(data: &DatabaseConnectionData) -> Result<()> {
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

impl InventoryColumn {
    /// Inserts a new `InventoryColumn` record into the database.
    pub async fn insert(
        data: &DatabaseConnectionData,
        name: impl AsRef<str>,
        display_name: Option<impl AsRef<str>>,
        visible: bool,
        attributes: Option<impl AsRef<str>>,
        database_id: u64,
    ) -> Result<()> {
        let pool = create_pool(data).await?;

        sqlx::query(
            r#"
            INSERT INTO inventory_columns (name, display_name, visible, attributes, database_id)
            VALUES (?, ?, ?, ?, ?);
            "#,
        )
        .bind(name.as_ref()) // Name
        .bind(display_name.as_ref().map(|dn| dn.as_ref())) // Display Name
        .bind(visible) // Visible
        .bind(attributes.as_ref().map(|attr| attr.as_ref())) // Attributes
        .bind(database_id) // Database ID
        .execute(&pool)
        .await?;

        Ok(())
    }

    /// Fetches all `InventoryColumn` records for a specific `database_id`.
    pub async fn get_all(data: &DatabaseConnectionData, database_id: u64) -> Result<Vec<Self>> {
        let pool = create_pool(data).await?;
        let columns = sqlx::query_as::<_, InventoryColumn>(
            r#"
            SELECT * FROM inventory_columns WHERE database_id = ?;
            "#,
        )
        .bind(database_id)
        .fetch_all(&pool)
        .await?;

        Ok(columns)
    }

    /// Updates the `InventoryColumn` with new values for `display_name`, `visible`, and `attributes`.
    pub async fn update(&self, database_id: u64, data: &DatabaseConnectionData) -> Result<()> {
        let pool = create_pool(data).await?;

        sqlx::query(
            r#"
            UPDATE inventory_columns
            SET display_name = ?, visible = ?, attributes = ?
            WHERE name = ? AND database_id = ? LIMIT 1;
            "#,
        )
        .bind(&self.display_name) // Updated display name
        .bind(self.visible) // Updated visibility
        .bind(&self.attributes) // Updated attributes
        .bind(&self.name) // Column name
        .bind(database_id) // Database ID
        .execute(&pool)
        .await?;

        Ok(())
    }

    /// Deletes a column by name and database ID.
    pub async fn delete(
        data: &DatabaseConnectionData,
        database_id: u64,
        name: impl AsRef<str>,
    ) -> Result<()> {
        let pool = create_pool(data).await?;
        sqlx::query(
            r#"
            DELETE FROM inventory_columns
            WHERE name = ? AND database_id = ? LIMIT 1;
            "#,
        )
        .bind(name.as_ref()) // Column name
        .bind(database_id) // Database ID
        .execute(&pool)
        .await?;

        Ok(())
    }
}
