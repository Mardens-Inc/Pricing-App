use crate::data_database_connection::{create_pool, DatabaseConnectionData};
use crate::options_data::{InventoryOptions, Inventorying};
use crate::print_options_db;
use anyhow::Result;
use sqlx::{Executor, Row};

pub async fn initialize(data: &DatabaseConnectionData) -> Result<()> {
    let pool = create_pool(data).await?;
    pool.execute(
        r#"
CREATE TABLE IF NOT EXISTS `inventory_options`
(
    id                           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inventorying_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
    inventorying_add_if_missing  BOOLEAN NOT NULL DEFAULT FALSE,
    inventorying_remove_if_zero  BOOLEAN NOT NULL DEFAULT FALSE,
    inventorying_allow_additions BOOLEAN NOT NULL DEFAULT FALSE,
    show_color_dropdown          BOOLEAN NOT NULL DEFAULT FALSE,
    show_year_input              BOOLEAN NOT NULL DEFAULT FALSE,
    database_id                  BIGINT UNSIGNED
);
	"#,
    )
    .await?;

    Ok(())
}

impl InventoryOptions {
    /// Inserts a new `InventoryOptions` record into the database.
    pub async fn insert(&self, data: &DatabaseConnectionData, database_id: u64) -> Result<u64> {
        let pool = create_pool(data).await?;
        let result = sqlx::query(
            r#"
            INSERT INTO inventory_options (
                inventorying_enabled,
                inventorying_add_if_missing,
                inventorying_remove_if_zero,
                inventorying_allow_additions,
                show_color_dropdown,
                show_year_input,
                database_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(self.inventorying.is_some()) // inventorying_enabled
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
        .bind(self.show_color_dropdown) // show_color_dropdown
        .bind(self.show_year_input) // show_year_input
        .bind(database_id) // database_id
        .execute(&pool)
        .await?;

        print_options_db::set(&pool, database_id, &self.print_form).await?;

        Ok(result.last_insert_id())
    }

    /// Retrieves an `InventoryOptions` record by `database_id`.
    pub async fn get(data: &DatabaseConnectionData, database_id: u64) -> Result<Option<Self>> {
        let pool = create_pool(data).await?;
        if let Some(row) = sqlx::query(
            r#"
            SELECT * FROM inventory_options
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
                print_form: print_options_db::get(&data, database_id).await?,
                show_color_dropdown: row.try_get("show_color_dropdown")?,
                show_year_input: row.try_get("show_year_input")?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Updates an existing `InventoryOptions` record identified by `database_id`.
    pub async fn update(&self, data: &DatabaseConnectionData, database_id: u64) -> Result<()> {
        let pool = create_pool(data).await?;
        sqlx::query(
            r#"
            UPDATE inventory_options
            SET
                inventorying_enabled = ?,
                inventorying_add_if_missing = ?,
                inventorying_remove_if_zero = ?,
                inventorying_allow_additions = ?,
                show_color_dropdown = ?,
                show_year_input = ?
            WHERE database_id = ?
            "#,
        )
        .bind(self.inventorying.is_some()) // inventorying_enabled
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
        .bind(self.show_color_dropdown) // show_color_dropdown
        .bind(self.show_year_input) // show_year_input
        .bind(database_id) // database_id
        .execute(&pool)
        .await?;

        print_options_db::set(&pool, database_id, &self.print_form).await?;

        Ok(())
    }

    /// Deletes an `InventoryOptions` record identified by `database_id`.
    pub async fn delete(data: &DatabaseConnectionData, database_id: u64) -> Result<()> {
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

        print_options_db::delete_all(&pool, database_id).await?;

        Ok(())
    }
}
