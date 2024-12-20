use crate::columns_db::{set_attributes, set_display_name, set_visibility};
use crate::data_database_connection::DatabaseConnectionData;
use actix_web::{get, patch, web, HttpResponse, Responder};
use crypto::hashids::decode_single;
use log::debug;
use std::collections::HashMap;
use std::error::Error;
use std::sync::Arc;

#[get("")]
pub async fn get_columns(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder, Box<dyn Error>> {
    let id = decode_single(id.as_ref())?;
    let data = data.get_ref().as_ref();
    let columns = crate::columns_db::get_columns(id, data).await?;
    Ok(HttpResponse::Ok().json(columns))
}

#[patch("/names")]
pub async fn update_column_names(
    id: web::Path<String>,
    body: String,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder, Box<dyn Error>> {
    let id = decode_single(id.as_ref())?;
    let lines = body.lines();
    let data = data.get_ref().as_ref();
    let sections: HashMap<String, String> = lines
        .map(|line| {
            let parts = line.split("=").collect::<Vec<&str>>();
            (parts[0].trim().to_string(), parts[1].trim().to_string())
        })
        .collect();

    for (name, display_name) in sections.iter() {
        debug!(
            "Setting display name for {} to {} in for database with id of {}",
            name, display_name, id
        );
        set_display_name(id, name, display_name, data).await?;
    }

    Ok(HttpResponse::Ok().finish())
}

#[patch("/visibility")]
pub async fn update_column_visibility(
    id: web::Path<String>,
    body: String,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder, Box<dyn Error>> {
    let id = decode_single(id.as_ref())?;
    let lines = body.lines();
    let data = data.get_ref().as_ref();
    let sections: HashMap<String, bool> = lines
        .map(|line| {
            let parts = line.split("=").collect::<Vec<&str>>();
            (
                parts[0].trim().to_string(),
                parts[1].trim().parse::<bool>().unwrap(),
            )
        })
        .collect();

    for (name, visible) in sections.iter() {
        debug!(
            "Setting visibility for {} to {} in for database with id of {}",
            name, visible, id
        );
        set_visibility(id, name, *visible, data).await?;
    }

    Ok(HttpResponse::Ok().finish())
}

#[patch("/attributes")]
pub async fn update_column_attributes(
    id: web::Path<String>,
    body: String,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder, Box<dyn Error>> {
    let id = decode_single(id.as_ref())?;
    let data = data.get_ref().as_ref();
    set_attributes(id, "name", body, data).await?;

    Ok(HttpResponse::Ok().finish())
}
