use crate::columns_data::InventoryColumn;
use actix_web::{get, patch, web, HttpResponse, Responder};
use crypto::hashids::decode_single;
use log::debug;
use serde_json::json;
use std::collections::HashMap;
use std::sync::Arc;
use database_common_lib::database_connection::DatabaseConnectionData;
use database_common_lib::http_error::Result;

#[get("/")]
pub async fn get_columns(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let id = decode_single(id.as_ref())?;
    let data = data.get_ref().as_ref();
    let columns = InventoryColumn::get_all(data, id).await?;
    Ok(HttpResponse::Ok().json(columns))
}

#[patch("/")]
pub async fn update_columns(
    id: web::Path<String>,
    columns: web::Json<HashMap<String, InventoryColumn>>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let id = decode_single(id.as_ref())?;
    let data = data.get_ref().as_ref();
    for (name, column) in columns.into_inner() {
        debug!("Updating column: {}", name);
        column.update(id, data).await?;
    }

    Ok(HttpResponse::Ok().finish())
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/inventory/{id}/columns")
            .service(get_columns)
            .service(update_columns)
            .default_service(web::to(|| async {
                // Handle unmatched API endpoints
                HttpResponse::NotFound().json(json!({"error": "API endpoint not found"}))
            })),
    );
}
