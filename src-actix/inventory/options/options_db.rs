use crate::options_data::{InventoryOptions, Inventorying};
use crate::print_options_db;
use database_common_lib::database_connection::{create_pool, DatabaseConnectionData};
use database_common_lib::http_error::Result;
use sqlx::{Executor, MySqlPool, Row};

pub async fn initialize(pool: &MySqlPool) -> Result<()> {
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
    show_database_dropdown       BOOLEAN NOT NULL DEFAULT FALSE,
    database_id                  BIGINT UNSIGNED
);
	"#,
    )
    .await?;

    print_options_db::initialize(&pool).await?;

    Ok(())
}

impl InventoryOptions {
    /// Inserts a new `InventoryOptions` record into the database.
    pub async fn insert(&self, database_id: u64, data: &DatabaseConnectionData) -> Result<u64> {
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
                show_database_dropdown,
                database_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
        .bind(self.show_department_dropdown)
        .bind(database_id) // database_id
        .execute(&pool)
        .await?;

        print_options_db::set(&pool, database_id, &self.print_form).await?;

        Ok(result.last_insert_id())
    }

    /// Retrieves an `InventoryOptions` record by `database_id`.
    pub async fn get(database_id: u64, data: &DatabaseConnectionData) -> Result<Option<Self>> {
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
                inventorying: row.try_get::<bool, _>("inventorying_enabled")?.then(|| {
                    Inventorying {
                        add_if_missing: row.try_get("inventorying_add_if_missing").unwrap_or(false),
                        remove_if_zero: row.try_get("inventorying_remove_if_zero").unwrap_or(false),
                        allow_additions: row
                            .try_get("inventorying_allow_additions")
                            .unwrap_or(false),
                    }
                }),
                print_form: print_options_db::get(&data, database_id).await?,
                show_color_dropdown: row.try_get("show_color_dropdown")?,
                show_year_input: row.try_get("show_year_input")?,
                show_department_dropdown: row.try_get("show_database_dropdown")?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Updates an existing `InventoryOptions` record identified by `database_id`.
    pub async fn update(&self, database_id: u64, data: &DatabaseConnectionData) -> Result<()> {
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
                show_year_input = ?,
                show_database_dropdown = ?
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
        .bind(self.show_department_dropdown)
        .bind(database_id) // database_id
        .execute(&pool)
        .await?;

        print_options_db::set(&pool, database_id, &self.print_form).await?;

        Ok(())
    }

    /// Deletes an `InventoryOptions` record identified by `database_id`.
    pub async fn delete(database_id: u64, data: &DatabaseConnectionData) -> Result<()> {
        let pool = create_pool(data).await?;
        Self::delete_with_connection(database_id, &pool).await?;

        Ok(())
    }

    pub async fn delete_with_connection(database_id: u64, pool: &MySqlPool) -> Result<()> {
        sqlx::query(
            r#"
            DELETE FROM inventory_options
            WHERE database_id = ?
            "#,
        )
        .bind(database_id)
        .execute(pool)
        .await?;
        Ok(())
    }
}
