// -------------
// For debugging purposes only
// TODO: Remove for production
#![allow(clippy::all)]
// -------------
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

// Inventory Columns Modules
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
#[path = "inventory/options/options_data.rs"]
mod options_data;
#[path = "inventory/options/options_db.rs"]
mod options_db;
#[path = "inventory/options/options_endpoint.rs"]
mod options_endpoint;

use crate::data_database_connection::DatabaseConnectionData;
use crate::server_information_endpoint::get_server_version;
use actix_files::file_extension_to_mime;
use actix_web::error::ErrorInternalServerError;
use actix_web::{
    get, middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder,
};
use awc::Client;
use futures_util::stream::StreamExt;
use include_dir::{include_dir, Dir};
use log::{debug, error, info};
use serde_json::json;
use std::process::Child;

pub static DEBUG: bool = cfg!(debug_assertions);

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "debug");
    env_logger::init();

    let port = 1421; // Port to listen on

    let data = match DatabaseConnectionData::get().await {
        Ok(d) => d,
        Err(err) => {
            error!("Failed to get database connection data: {}", err);
            return Ok(());
        }
    };

    list_db::initialize(&data).await.map_err(|err| {
        error!("Failed to initialize database: {}", err);
        std::io::Error::new(std::io::ErrorKind::Other, "Failed to initialize database")
    })?;

    let connection_data_mutex = web::Data::new(std::sync::Arc::new(data));

    let server = HttpServer::new(move || {
        let app = App::new()
            .wrap(middleware::Logger::default())
            .app_data(
                web::JsonConfig::default()
                    .limit(4096)
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
            // Make sure all errors are returned as JSON
            .service(
                web::scope("api")
                    .service(get_server_version)
                    .service(
                        web::scope("list")
                            .service(list_endpoint::get_all_locations)
                            .service(list_endpoint::get_location)
                            .service(list_endpoint::create_location)
                            .service(list_endpoint::delete_location)
                            .app_data(connection_data_mutex.clone()),
                    )
                    .service(
                        web::scope("inventory/{id}")
                            .service(inventory_endpoint::get_inventory)
                            .service(inventory_endpoint::get_inventory_headers)
                            .service(inventory_endpoint::get_inventory_options)
                            .service(inventory_endpoint::insert_record)
                            .service(inventory_endpoint::upload_inventory)
                            .service(inventory_endpoint::download_inventory)
                            .service(web::scope("columns").service(columns_endpoint::get_columns))
                            .app_data(connection_data_mutex.clone()),
                    )
                    .service(
                        web::scope("icons")
                            .service(icons_endpoint::get_icons)
                            .service(icons_endpoint::get_icon),
                    ),
            );

        // Add conditional routing based on the config
        if DEBUG {
            app.default_service(web::route().to(proxy_to_vite))
                .service(web::resource("/assets/{file:.*}").route(web::get().to(proxy_to_vite)))
                .service(
                    web::resource("/node_modules/{file:.*}").route(web::get().to(proxy_to_vite)),
                )
        } else {
            app.default_service(web::route().to(index))
                .service(web::scope("assets/{file}").service(assets))
        }
    })
    .workers(4)
    .bind(format!("0.0.0.0:{port}", port = port))?
    .run();

    info!(
        "Starting {} server at http://127.0.0.1:{}",
        if DEBUG { "development" } else { "production" },
        port
    );
    if DEBUG {
        start_vite_server().expect("Failed to start vite server");
    }
    server.await
}

// The maximum payload size allowed for forwarding requests and responses.
//
// This constant defines the maximum size (in bytes) for the request and response payloads
// when proxying. Any payload exceeding this size will result in an error.
//
// Currently, it is set to 1 GB.
const MAX_PAYLOAD_SIZE: usize = 1024 * 1024 * 1024; // 1 GB

// Static directory including all files under `target/wwwroot`.
//
// This static directory is used to embed files into the binary at compile time.
// The `WWWROOT` directory will be used to serve static files such as `index.html`.
static WWWROOT: Dir = include_dir!("target/wwwroot");
// Handles the request for the index.html file.
//
// This function serves the `index.html` file from the embedded directory
// if it exists, and returns an internal server error if the file is not found.
//
// # Arguments
//
// * `_req` - The HTTP request object.
//
// # Returns
//
// An `impl Responder` which can either be a successful HTTP response containing
// the `index.html` file, or an internal server error.
async fn index(_req: HttpRequest) -> Result<impl Responder, Error> {
    if let Some(file) = WWWROOT.get_file("index.html") {
        let body = file.contents();
        return Ok(HttpResponse::Ok().content_type("text/html").body(body));
    }
    Err(ErrorInternalServerError("Failed to find index.html"))
}

#[get("")]
async fn assets(file: web::Path<String>) -> impl Responder {
    if let Some(file) = WWWROOT.get_file(format!("assets/{}", file.as_str())) {
        let body = file.contents();
        return Ok(HttpResponse::Ok()
            .content_type(file_extension_to_mime(
                file.path().extension().unwrap().to_str().unwrap(),
            ))
            .body(body));
    }
    Err(ErrorInternalServerError(format!("Failed to find {}", file)))
}

// Proxies requests to the Vite development server.
//
// This function forwards incoming requests to a local Vite server running on port 3000.
// It buffers the entire request payload and response payload to avoid partial transfers.
// Requests and responses larger than the maximum payload size will result in an error.
//
// # Arguments
//
// * `req` - The HTTP request object.
// * `payload` - The request payload.
//
// # Returns
//
// An `HttpResponse` which contains the response from the Vite server,
// or an error response in case of failure.
async fn proxy_to_vite(req: HttpRequest, mut payload: web::Payload) -> Result<HttpResponse, Error> {
    let client = Client::new();
    let forward_url = format!("http://localhost:3000{}", req.uri());

    // Buffer the entire payload
    let mut body_bytes = web::BytesMut::new();
    while let Some(chunk) = payload.next().await {
        let chunk = chunk?;
        if (body_bytes.len() + chunk.len()) > MAX_PAYLOAD_SIZE {
            return Err(actix_web::error::ErrorPayloadTooLarge("Payload overflow"));
        }
        body_bytes.extend_from_slice(&chunk);
    }

    let mut forwarded_resp = client
        .request_from(forward_url.as_str(), req.head())
        .no_decompress()
        .send_body(body_bytes)
        .await
        .map_err(|err| ErrorInternalServerError(format!("Failed to forward request: {}", err)))?;

    // Buffer the entire response body
    let mut resp_body_bytes = web::BytesMut::new();
    while let Some(chunk) = forwarded_resp.next().await {
        let chunk = chunk?;
        if (resp_body_bytes.len() + chunk.len()) > MAX_PAYLOAD_SIZE {
            return Err(actix_web::error::ErrorPayloadTooLarge(
                "Response payload overflow",
            ));
        }
        resp_body_bytes.extend_from_slice(&chunk);
    }

    // Build the response
    let mut res = HttpResponse::build(forwarded_resp.status());

    // Copy headers
    for (header_name, header_value) in forwarded_resp.headers().iter() {
        res.insert_header((header_name.clone(), header_value.clone()));
    }

    Ok(res.body(resp_body_bytes))
}

fn start_vite_server() -> Result<Child, Box<dyn std::error::Error>> {
    #[cfg(target_os = "windows")]
    let find_cmd = "where";
    #[cfg(not(target_os = "windows"))]
    let find_cmd = "which";

    let vite = std::process::Command::new(find_cmd)
        .arg("vite")
        .stdout(std::process::Stdio::piped())
        .output()?
        .stdout;

    let vite = String::from_utf8(vite);
    let vite = vite.unwrap();
    let vite = vite.as_str().trim();

    if vite.is_empty() {
        error!("vite not found, make sure its installed with npm install -g vite");
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "vite not found",
        ))?;
    }

    // Get the first occurrence
    let vite = vite
        .split("\n")
        .collect::<Vec<_>>()
        .last()
        .expect("Failed to get vite executable")
        .trim();

    debug!("found vite at: {:?}", vite);

    // Start the vite server
    Ok(std::process::Command::new(vite)
        .current_dir(r#"../../"#)
        .spawn()
        .expect("Failed to start vite server"))
}
