use actix_web::get;

#[get("/version")]
pub async fn get_server_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
