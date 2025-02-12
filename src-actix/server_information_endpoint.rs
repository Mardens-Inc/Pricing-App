use actix_web::get;
use crate::constants::VERSION;

#[get("/version")]
pub async fn get_server_version() -> String {
    VERSION.to_string()
}
