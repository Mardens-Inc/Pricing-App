// -------------
// For debugging purposes only
// TODO: Remove for production
#![allow(clippy::all)]
// -------------
use vite_actix::{start_vite_server, ViteAppFactory};
pub mod data_database_connection;
mod icons_endpoint;
mod server_information_endpoint;

// Inventory Modules
#[path = "inventory/inventory_data.rs"]
pub mod inventory_data;
#[path = "inventory/inventory_db.rs"]
pub mod inventory_db;
#[path = "inventory/inventory_endpoint.rs"]
mod inventory_endpoint;

// Inventory Column Modules
#[path = "inventory/columns/columns_data.rs"]
pub mod columns_data;
#[path = "inventory/columns/columns_db.rs"]
pub mod columns_db;
#[path = "inventory/columns/columns_endpoint.rs"]
mod columns_endpoint;

// Inventory List Modules
#[path = "list/list_data.rs"]
pub mod list_data;
#[path = "list/list_db.rs"]
pub mod list_db;
#[path = "list/list_endpoint.rs"]
mod list_endpoint;
mod mysql_row_wrapper;

// Inventory Options Modules
mod asset_endpoint;
mod http_error;
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

use crate::asset_endpoint::AssetsAppConfig;
use crate::data_database_connection::DatabaseConnectionData;
use crate::server_information_endpoint::get_server_version;
use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use anyhow::Result;
use log::*;
use serde_json::json;

pub static DEBUG: bool = cfg!(debug_assertions);
const PORT: u16 = 1421;

pub async fn run() -> Result<()> {
    // Set the logging level and initialize the logger
    std::env::set_var("RUST_LOG", "debug");
    env_logger::init();

    // Fetch database connection data
    let data = DatabaseConnectionData::get().await?;

    // Initialize necessary databases
    list_db::initialize(&data).await?;
    options_db::initialize(&data).await?;

    let connection_data_mutex = web::Data::new(std::sync::Arc::new(data));

    let server = HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::default()) // Add logger middleware
            .app_data(
                web::JsonConfig::default()
                    .limit(4096) // Set JSON payload size limit
                    .error_handler(|err, _req| {
                        error!("Failed to parse JSON: {}", err);
                        let error = json!({ "error": format!("{}", err) });
                        actix_web::error::InternalError::from_response(
                            err,
                            HttpResponse::BadRequest().json(error),
                        )
                        .into()
                    }),
            )
            .service(
                web::scope("api")
                    .service(get_server_version)
                    .configure(icons_endpoint::configure)
                    .configure(list_endpoint::configure)
                    .configure(inventory_endpoint::configure)
                    .configure(options_endpoint::configure)
                    .app_data(connection_data_mutex.clone()),
            )
            .configure_routes()
            .configure_vite()
    })
    .workers(4) // Set number of workers
    .bind(format!("0.0.0.0:{port}", port = PORT))? // Bind to specified port
    .run();

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
