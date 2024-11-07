use crate::data_database_connection::DatabaseConnectionData;
use crate::DEBUG;
use log::{debug, error};
use sqlx::pool::PoolOptions;
use sqlx::AnyPool;
use std::error::Error;


pub async fn initialize(data: Option<&DatabaseConnectionData>) -> Result<(), Box<dyn Error>> {
	let pool = create_pool(data).await?;
	sqlx::query(
		r#"
CREATE TABLE IF NOT EXISTS locations
(
    id           INTEGER AUTO_INCREMENT PRIMARY KEY,
    name         TEXT                                NOT NULL,
    location     TEXT                                NOT NULL,
    po           TEXT                                NOT NULL,
    image        TEXT                                NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
		"#
	).execute(&pool).await?;

	Ok(())
}
async fn create_pool(data: Option<&DatabaseConnectionData>) -> Result<AnyPool, Box<dyn Error>> {
	if DEBUG {
		debug!("Creating SQLite debug connection");
		// Use PoolOptions for better connection pooling
		let pool = PoolOptions::new()
			.connect("sqlite://./pricing.db")
			.await?;
		Ok(pool)
	} else {
		if let Some(data) = data {
			debug!("Creating MySQL production connection");
			let pool = PoolOptions::new()
				.connect(format!("mysql://{}:{}@{}/pricing", data.user, data.password, data.host).as_str())
				.await?;
			Ok(pool)
		} else {
			error!("No database connection data provided");
			Err("No database connection data provided".into())
		}
	}
}