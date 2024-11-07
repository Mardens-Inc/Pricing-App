use crate::data_database_connection::DatabaseConnectionData;
use crate::list_data::{HashedLocationListItem, LocationListItem, LocationListItemNoId};
use crypto::hashids::{decode, encode};
use log::debug;
use sqlx::MySqlPool;
use std::error::Error;

pub async fn initialize(data: &DatabaseConnectionData) -> Result<(), Box<dyn Error>> {
	let pool = create_pool(data).await?;
	sqlx::query(
		r#"
CREATE TABLE IF NOT EXISTS locations
(
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(255)                        NOT NULL,
    location  VARCHAR(255)                        NOT NULL,
    po        VARCHAR(255)                        NOT NULL,
    image     VARCHAR(255)                        NOT NULL,
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
		"#,
	)
		.execute(&pool)
		.await?;

	Ok(())
}
async fn create_pool(data: &DatabaseConnectionData) -> Result<MySqlPool, Box<dyn Error>> {
	debug!("Creating MySQL production connection");
	let pool = MySqlPool::connect(&format!(
		"mysql://{}:{}@{}/pricing",
		data.user, data.password, data.host
	))
		.await?;
	Ok(pool)
}

pub async fn get_all(
	data: &DatabaseConnectionData,
) -> Result<Vec<HashedLocationListItem>, Box<dyn Error>> {
	let pool = create_pool(data).await?;
	let locations = sqlx::query_as::<_, LocationListItem>(
		r#"
		select * from locations
		"#,
	).fetch_all(&pool).await?;

	let locations = locations
		.iter()
		.map(|item| HashedLocationListItem {
			id: encode(&[item.id as u64]),
			name: item.name.clone(),
			location: item.location.clone(),
			po: item.po.clone(),
			image: item.image.clone(),
			post_date: item.post_date.clone(),
		})
		.collect();

	Ok(locations)
}

pub async fn insert(
	location: &LocationListItemNoId,
	data: &DatabaseConnectionData,
) -> Result<(), Box<dyn Error>> {
	let pool = create_pool(data).await?;
	sqlx::query(
		r#"
		insert into locations (name, location, po, image)
		values (?, ?, ?, ?)
		"#,
	)
		.bind(&location.name)
		.bind(&location.location)
		.bind(&location.po)
		.bind(&location.image)
		.execute(&pool)
		.await?;
	Ok(())
}

pub async fn delete(
	id: impl AsRef<str>,
	data: &DatabaseConnectionData,
) -> Result<(), Box<dyn Error>> {
	let id = id.as_ref();
	let id = decode(id).map_err(|_| "Invalid ID")?[0];
	let pool = create_pool(data).await?;
	sqlx::query(
		r#"
		delete from locations
		where id = ?
		"#,
	)
		.bind(id)
		.execute(&pool)
		.await?;
	Ok(())
}