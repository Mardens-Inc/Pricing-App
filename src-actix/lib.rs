// -------------
// For debugging purposes only
// TODO: Remove for production
#![allow(clippy::all)]
// -------------
use vite_actix::start_vite_server;
pub mod icons_endpoint;
pub mod server_information_endpoint;

// Inventory Modules
#[path = "inventory/inventory_data.rs"]
pub mod inventory_data;
#[path = "inventory/inventory_db.rs"]
pub mod inventory_db;
#[path = "inventory/inventory_endpoint.rs"]
pub mod inventory_endpoint;

// Inventory Column Modules
#[path = "inventory/columns/columns_data.rs"]
pub mod columns_data;
#[path = "inventory/columns/columns_db.rs"]
pub mod columns_db;
#[path = "inventory/columns/columns_endpoint.rs"]
pub mod columns_endpoint;

// Inventory List Modules
#[path = "list/list_data.rs"]
pub mod list_data;
#[path = "list/list_db.rs"]
pub mod list_db;
#[path = "list/list_endpoint.rs"]
pub mod list_endpoint;
mod mysql_row_wrapper;

// Inventory Options Modules
pub mod constants;
#[path = "excel/csv.rs"]
pub mod csv;
#[path = "excel/excel.rs"]
pub mod excel;
#[path = "inventory/options/options_data.rs"]
pub mod options_data;
#[path = "inventory/options/options_db.rs"]
pub mod options_db;
#[path = "inventory/options/options_endpoint.rs"]
mod options_endpoint;
#[path = "inventory/options/print_options/print_options_data.rs"]
pub mod print_options_data;
#[path = "inventory/options/print_options/print_options_db.rs"]
pub mod print_options_db;
#[path = "excel/spreadsheet_endpoint.rs"]
pub mod spreadsheet_endpoint;

use crate::constants::{initialize_asset_directories, DEBUG, PORT};
use crate::server_information_endpoint::get_server_version;
use actix_web::{web, HttpResponse};
use anyhow::Result;
use database_common_lib::actix_extension::create_http_server;
use database_common_lib::database_connection::{create_pool, DatabaseConnectionData};
use include_dir::include_dir;
use log::*;
use serde_json::json;

pub async fn run() -> Result<()> {
    // Set the logging level and initialize the logger
    env_logger::builder().filter_level(LevelFilter::Info).init();

    // This will create the needed asset directories.
    initialize_asset_directories()?;

    // Fetch database connection data
    let data = DatabaseConnectionData::get().await?;

    // Initialize necessary databases
    let pool = create_pool(&data).await?;
    list_db::initialize(&pool).await?;
    options_db::initialize(&pool).await?;
    pool.close().await;

    let connection_data_mutex = web::Data::new(std::sync::Arc::new(data));
    let server = create_http_server(
        move || {
            let connection_data_mutex = connection_data_mutex.clone();
            Box::new(move |cfg| {
                cfg.service(
                    web::scope("api")
                        .service(get_server_version)
                        .configure(icons_endpoint::configure)
                        .configure(list_endpoint::configure)
                        .configure(columns_endpoint::configure)
                        .configure(options_endpoint::configure)
                        .configure(spreadsheet_endpoint::configure)
                        .configure(inventory_endpoint::configure)
                        .default_service(web::to(|| async {
                            // Handle unmatched API endpoints
                            HttpResponse::NotFound()
                                .json(json!({"error": "API endpoint not found"}))
                        }))
                        .app_data(connection_data_mutex.clone()),
                );
            })
        },
        include_dir!("target/wwwroot"),
        PORT,
    )?;

    info!(
        "Starting {} server at http://127.0.0.1:{}",
        if DEBUG { "development" } else { "production" },
        PORT
    );

    // Start the Vite server in development mode
    if DEBUG {
        start_vite_server().expect("Failed to start vite server");
    }

    Ok(server.await?)
}
