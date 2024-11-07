use std::error::Error;
use log::debug;
use sqlx::MySqlPool;
use crate::data_database_connection::DatabaseConnectionData;

async fn create_pool(data: &DatabaseConnectionData) -> Result<MySqlPool, Box<dyn Error>> {
	debug!("Creating MySQL production connection");
	let pool = MySqlPool::connect(&format!(
		"mysql://{}:{}@{}/pricing",
		data.user, data.password, data.host
	))
		.await?;
	Ok(pool)
}