use crate::data_database_connection::DatabaseConnectionData;
use actix_web::{get, patch, web, HttpResponse, Responder};
use crypto::hashids::decode_single;
use log::debug;
use std::collections::HashMap;
use std::sync::Arc;
use crate::columns_data::InventoryColumn;
use crate::http_error::Result;

#[get("")]
pub async fn get_columns(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let id = decode_single(id.as_ref())?;
    let data = data.get_ref().as_ref();
    let columns = InventoryColumn::get_all(data, id).await?;
    Ok(HttpResponse::Ok().json(columns))
}

#[patch("")]
pub async fn update_columns(
    columns: web::Json<HashMap<String, InventoryColumn>>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let data = data.get_ref().as_ref();
    for (name, column) in columns.into_inner() {
        debug!("Updating column: {}", name);
        column.update(data).await?;
    }
    
    Ok(HttpResponse::Ok().finish())
}