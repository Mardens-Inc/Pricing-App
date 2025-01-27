use anyhow::Result;

#[actix_web::main]
async fn main() -> Result<()> {
    pricing_app_lib::run().await
}
