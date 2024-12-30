use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};
use sqlx::FromRow;

#[derive(FromRow)]
pub struct InventoryColumn {
    pub id: u64,
    pub name: String,
    pub display_name: Option<String>,
    pub visible: bool,
    pub attributes: Option<String>,
    pub database_id: u64,
}

impl Serialize for InventoryColumn {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut map = serializer.serialize_map(Some(5))?;
        map.serialize_entry("name", &self.name)?;
        map.serialize_entry("display_name", &self.display_name)?;
        map.serialize_entry("visible", &self.visible)?;

        if let Some(attributes) = &self.attributes {
            let attributes: Vec<String> = attributes.split(",").map(|s| s.to_string()).collect();
            map.serialize_entry("attributes", &attributes)?;
        }

        map.end()
    }
}
