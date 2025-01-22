use serde::de::{self, Deserializer, MapAccess, Visitor};
use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};
use sqlx::FromRow;
use std::fmt;

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

impl<'de> serde::Deserialize<'de> for InventoryColumn {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct InventoryColumnVisitor;

        impl<'de> Visitor<'de> for InventoryColumnVisitor {
            type Value = InventoryColumn;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("a map representing an InventoryColumn")
            }

            fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
            where
                A: MapAccess<'de>,
            {
                let mut id = None;
                let mut name = None;
                let mut display_name = None;
                let mut visible = None;
                let mut attributes = None;
                let mut database_id = None;

                while let Some(key) = map.next_key::<String>()? {
                    match key.as_str() {
                        "id" => id = Some(map.next_value()?),
                        "name" => name = Some(map.next_value()?),
                        "display_name" => display_name = Some(map.next_value()?),
                        "visible" => visible = Some(map.next_value()?),
                        "attributes" => {
                            let attr: Option<Vec<String>> = map.next_value()?;
                            attributes = attr.map(|vec| vec.join(","));
                        }
                        "database_id" => database_id = Some(map.next_value()?),
                        _ => {
                            return Err(de::Error::unknown_field(
                                &key,
                                &[
                                    "id",
                                    "name",
                                    "display_name",
                                    "visible",
                                    "attributes",
                                    "database_id",
                                ],
                            ))
                        }
                    }
                }

                let id = id.ok_or_else(|| de::Error::missing_field("id"))?;
                let name = name.ok_or_else(|| de::Error::missing_field("name"))?;
                let visible = visible.ok_or_else(|| de::Error::missing_field("visible"))?;
                let database_id =
                    database_id.ok_or_else(|| de::Error::missing_field("database_id"))?;

                Ok(InventoryColumn {
                    id,
                    name,
                    display_name,
                    visible,
                    attributes,
                    database_id,
                })
            }
        }

        deserializer.deserialize_map(InventoryColumnVisitor)
    }
}
