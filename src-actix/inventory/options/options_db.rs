use crate::data_database_connection::DatabaseConnectionData;
use crate::options_data::{InventoryOptions, Inventorying, PrintForm};
use log::debug;
use sqlx::{Executor, MySqlPool, Row};
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

pub async fn initialize(data: &DatabaseConnectionData) -> Result<(), Box<dyn Error>> {
    let pool = create_pool(data).await?;
    pool.execute(
        r#"
CREATE TABLE IF NOT EXISTS `inventory_options`
(
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inventorying_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    inventorying_add_if_missing BOOLEAN NOT NULL DEFAULT FALSE,
    inventorying_remove_if_zero BOOLEAN NOT NULL DEFAULT FALSE,
    inventorying_allow_additions BOOLEAN NOT NULL DEFAULT FALSE,
    
    print_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    print_year TINYINT UNSIGNED DEFAULT NULL,
    print_label VARCHAR(120) DEFAULT NULL,
    print_show_retail_value BOOLEAN NOT NULL DEFAULT FALSE,
    print_show_retail_label BOOLEAN NOT NULL DEFAULT FALSE,
    
    database_id  BIGINT UNSIGNED
);
	"#,
    )
    .await?;

    Ok(())
}

impl InventoryOptions {
    /// Inserts a new `InventoryOptions` record into the database.
    pub async fn insert(
        &self,
        data: &DatabaseConnectionData,
        database_id: u64,
    ) -> Result<u64, Box<dyn Error>> {
        let pool = create_pool(data).await?;
        let result = sqlx::query(
            r#"
            INSERT INTO inventory_options (
                inventorying_enabled,
                inventorying_add_if_missing,
                inventorying_remove_if_zero,
                inventorying_allow_additions,
                print_enabled,
                print_year,
                print_label,
                print_show_retail_value,
                print_show_retail_label,
                database_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(
            self.inventorying
                .as_ref()
                .map_or(false, |i| i.add_if_missing),
        ) // inventorying_add_if_missing
        .bind(
            self.inventorying
                .as_ref()
                .map_or(false, |i| i.remove_if_zero),
        ) // inventorying_remove_if_zero
        .bind(
            self.inventorying
                .as_ref()
                .map_or(false, |i| i.allow_additions),
        ) // inventorying_allow_additions
        .bind(self.inventorying.is_some()) // inventorying_enabled
        .bind(self.print_form.is_some()) // print_enabled
        .bind(self.print_form.as_ref().and_then(|p| p.year)) // print_year
        .bind(self.print_form.as_ref().and_then(|p| p.label.clone())) // print_label
        .bind(self.print_form.as_ref().map_or(false, |p| p.show_retail)) // print_show_retail_value
        .bind(
            self.print_form
                .as_ref()
                .map_or(false, |p| p.show_price_label),
        ) // print_show_retail_label
        .bind(database_id) // database_id
        .execute(&pool)
        .await?;

        Ok(result.last_insert_id())
    }

    /// Retrieves an `InventoryOptions` record by `database_id`.
    pub async fn get(
        data: &DatabaseConnectionData,
        database_id: u64,
    ) -> Result<Option<Self>, Box<dyn Error>> {
        let pool = create_pool(data).await?;
        if let Some(row) = sqlx::query(
            r#"
            SELECT
                inventorying_add_if_missing,
                inventorying_remove_if_zero,
                inventorying_allow_additions,
                print_year,
                print_label,
                print_show_retail_value,
                print_show_retail_label
            FROM inventory_options
            WHERE database_id = ?
            "#,
        )
        .bind(database_id)
        .fetch_optional(&pool)
        .await?
        {
            Ok(Some(InventoryOptions {
                inventorying: Some(Inventorying {
                    add_if_missing: row.try_get::<bool, _>("inventorying_add_if_missing")?,
                    remove_if_zero: row.try_get::<bool, _>("inventorying_remove_if_zero")?,
                    allow_additions: row.try_get::<bool, _>("inventorying_allow_additions")?,
                }),
                print_form: Some(PrintForm {
                    year: row.try_get::<Option<u8>, _>("print_year")?,
                    label: row.try_get::<Option<String>, _>("print_label")?,
                    show_retail: row.try_get::<bool, _>("print_show_retail_value")?,
                    show_price_label: row.try_get::<bool, _>("print_show_retail_label")?,
                }),
            }))
        } else {
            Ok(None)
        }
    }

    /// Updates an existing `InventoryOptions` record identified by `database_id`.
    pub async fn update(
        &self,
        data: &DatabaseConnectionData,
        database_id: u64,
    ) -> Result<(), Box<dyn Error>> {
        let pool = create_pool(data).await?;
        sqlx::query(
            r#"
            UPDATE inventory_options
            SET
                inventorying_enabled = ?,
                inventorying_add_if_missing = ?,
                inventorying_remove_if_zero = ?,
                inventorying_allow_additions = ?,
                print_enabled = ?,
                print_year = ?,
                print_label = ?,
                print_show_retail_value = ?,
                print_show_retail_label = ?
            WHERE database_id = ?
            "#,
        )
        .bind(
            self.inventorying
                .as_ref()
                .map_or(false, |i| i.add_if_missing),
        ) // inventorying_add_if_missing
        .bind(
            self.inventorying
                .as_ref()
                .map_or(false, |i| i.remove_if_zero),
        ) // inventorying_remove_if_zero
        .bind(
            self.inventorying
                .as_ref()
                .map_or(false, |i| i.allow_additions),
        ) // inventorying_allow_additions
        .bind(self.inventorying.is_some()) // inventorying_enabled
        .bind(self.print_form.is_some()) // print_enabled
        .bind(self.print_form.as_ref().and_then(|p| p.year)) // print_year
        .bind(self.print_form.as_ref().and_then(|p| p.label.clone())) // print_label
        .bind(self.print_form.as_ref().map_or(false, |p| p.show_retail)) // print_show_retail_value
        .bind(
            self.print_form
                .as_ref()
                .map_or(false, |p| p.show_price_label),
        ) // print_show_retail_label
        .bind(database_id) // database_id
        .execute(&pool)
        .await?;

        Ok(())
    }

    /// Deletes an `InventoryOptions` record identified by `database_id`.
    pub async fn delete(
        data: &DatabaseConnectionData,
        database_id: u64,
    ) -> Result<(), Box<dyn Error>> {
        let pool = create_pool(data).await?;
        sqlx::query(
            r#"
            DELETE FROM inventory_options
            WHERE database_id = ?
            "#,
        )
        .bind(database_id)
        .execute(&pool)
        .await?;

        Ok(())
    }
}
