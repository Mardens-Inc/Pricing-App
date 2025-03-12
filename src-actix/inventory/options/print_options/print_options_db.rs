use crate::print_options_data::PrintForm;
use anyhow::{anyhow, Context, Result};
use database_common_lib::database_connection::{create_pool, DatabaseConnectionData};
use log::{debug, error};
use sqlx::{Executor, MySqlPool, Row};

pub async fn initialize(pool: &MySqlPool) -> Result<()> {
    debug!("Initializing print options database table");
    pool.execute(
        r#"
CREATE TABLE IF NOT EXISTS inventory_print_options
(
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hint                VARCHAR(255) DEFAULT NULL,
    label               VARCHAR(128) DEFAULT NULL,
    year                SMALLINT UNSIGNED DEFAULT NULL,
    department          SMALLINT UNSIGNED DEFAULT NULL,
    color               VARCHAR(128) DEFAULT NULL,
    size                VARCHAR(20) NULL DEFAULT '1x0.75',
    show_retail         BOOLEAN NOT NULL DEFAULT FALSE,
    show_price_label    BOOLEAN NOT NULL DEFAULT FALSE,
    percent_off_retail  SMALLINT UNSIGNED DEFAULT NULL,
    database_id         BIGINT UNSIGNED NOT NULL
);
    "#,
    )
    .await?;

    Ok(())
}

pub async fn get(
    data: &DatabaseConnectionData,
    database_id: u64,
) -> Result<Option<Vec<PrintForm>>> {
    let pool = create_pool(data).await?;
    let rows = sqlx::query(
        r#"
            select * from inventory_print_options where database_id = ?
"#,
    )
    .bind(database_id)
    .fetch_all(&pool)
    .await?;

    if rows.is_empty() {
        return Ok(None);
    }

    let mut items = vec![];

    for row in rows {
        items.push(PrintForm {
            id: row.try_get("id").unwrap_or(None),
            hint: row.try_get("hint").unwrap_or(None),
            label: row.try_get("label").unwrap_or(None),
            year: row.try_get("year").unwrap_or(None),
            department: row.try_get("department").unwrap_or(None),
            color: row.try_get("color").unwrap_or(None),
            size: row.try_get("size").unwrap_or(None),
            show_retail: row.try_get("show_retail").unwrap_or(false),
            show_price_label: row.try_get("show_price_label").unwrap_or(false),
            percent_off_retail: row
                .try_get::<Option<u8>, _>("percent_off_retail")
                .unwrap_or(None),
        })
    }

    Ok(Some(items))
}

pub async fn set(pool: &MySqlPool, database_id: u64, items: &Option<Vec<PrintForm>>) -> Result<()> {
    if let Some(items) = items {
        clean_unused_items(&pool, database_id, &items).await?;
        for item in items {
            if item.id.is_some() {
                if exists(&pool, database_id, &item).await? {
                    update_item(&pool, database_id, &item).await?;
                } else {
                    error!("Item with id {} does not exist", item.id.unwrap_or(0));
                    return Err(anyhow!(
                        "Item with id {} does not exist",
                        item.id.unwrap_or(0)
                    ));
                }
            } else {
                insert_item(&pool, database_id, &item).await?;
            }
        }
    } else {
        delete_all_with_connection(database_id, &pool).await?;
    }

    Ok(())
}

async fn insert_item(pool: &MySqlPool, database_id: u64, item: &PrintForm) -> Result<()> {
    sqlx::query(
        r#"
INSERT INTO inventory_print_options (
    hint,
    label,
    year,
    department,
    color,
    size,
    show_retail,
    show_price_label,
    percent_off_retail,                     
    database_id
) VALUES (?,?,?,?,?,?,?,?,?,?)
"#,
    )
    .bind(&item.hint)
    .bind(&item.label)
    .bind(&item.year)
    .bind(&item.department)
    .bind(&item.color)
    .bind(&item.size)
    .bind(item.show_retail)
    .bind(item.show_price_label)
    .bind(item.percent_off_retail)
    .bind(database_id)
    .execute(pool)
    .await?;
    Ok(())
}

async fn update_item(pool: &MySqlPool, database_id: u64, item: &PrintForm) -> Result<()> {
    let id = item.id.context("No id provided for update item")?;
    sqlx::query(
        r#"
    UPDATE inventory_print_options SET 
        hint = ?,
        label = ?,
        year = ?,
        department = ?,
        color = ?,
        size = ?,
        show_retail = ?,
        show_price_label = ?,
        percent_off_retail = ?
    WHERE id = ? AND database_id = ?;
"#,
    )
    .bind(&item.hint)
    .bind(&item.label)
    .bind(&item.year)
    .bind(&item.department)
    .bind(&item.color)
    .bind(&item.size)
    .bind(item.show_retail)
    .bind(item.show_price_label)
    .bind(item.percent_off_retail)
    .bind(id)
    .bind(database_id)
    .execute(pool)
    .await?;

    Ok(())
}

async fn exists(pool: &MySqlPool, database_id: u64, item: &PrintForm) -> Result<bool> {
    let id = item.id.context("No id provided for existence check")?;
    let rows = sqlx::query(
        r#"select id from inventory_print_options where database_id = ? and id = ? limit 1"#,
    )
    .bind(database_id)
    .bind(id)
    .fetch_one(pool)
    .await?;
    Ok(!rows.is_empty())
}

async fn delete_item(pool: &MySqlPool, database_id: u64, id: u64) -> Result<()> {
    sqlx::query(
        r#"
            delete from inventory_print_options where id = ? and database_id = ?;
            "#,
    )
    .bind(id)
    .bind(database_id)
    .execute(pool)
    .await?;

    Ok(())
}

async fn clean_unused_items(
    pool: &MySqlPool,
    database_id: u64,
    used_items: &Vec<PrintForm>,
) -> Result<()> {
    let used_ids: String = used_items
        .iter()
        .filter_map(|i| i.id)
        .map(|i| i.to_string())
        .collect::<Vec<_>>()
        .join(",");
    let unused_rows = sqlx::query(
        r#"
            select id from inventory_print_options where database_id = ? and id not in (?)
        "#,
    )
    .bind(database_id)
    .bind(used_ids)
    .fetch_all(pool)
    .await?;

    let unused_ids = unused_rows
        .iter()
        .map(|row| row.get::<u64, _>("id"))
        .collect::<Vec<_>>();
    for id in unused_ids {
        delete_item(&pool, database_id, id).await?;
    }

    Ok(())
}

pub async fn delete_all(database_id: u64, data: &DatabaseConnectionData) -> Result<()> {
    let pool = create_pool(data).await?;
    delete_all_with_connection(database_id, &pool).await
}

pub async fn delete_all_with_connection(database_id: u64, pool: &MySqlPool) -> Result<()> {
    sqlx::query(r#"delete from inventory_print_options where database_id = ?"#)
        .bind(database_id)
        .execute(pool)
        .await
        .context(format!(
            "Failed to delete all print options with an id of {}",
            database_id
        ))?;
    Ok(())
}
