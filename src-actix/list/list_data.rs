use actix_web::FromRequest;
use crypto::hashids::{decode, encode};
use serde::de::{MapAccess, Visitor};
use serde::ser::SerializeMap;
use serde::{Deserialize, Deserializer, Serialize};
use sqlx::FromRow;

#[derive(FromRow)]
pub struct LocationListItem {
    pub id: Option<u64>,
    pub name: String,
    pub location: String,
    pub po: String,
    pub image: String,
    pub post_date: chrono::DateTime<chrono::Utc>,
}

impl Serialize for LocationListItem {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(Some(5))?;
        if let Some(id) = self.id {
            let hashed_id = encode(&[id]);
            map.serialize_entry("id", &hashed_id)?;
        } else {
            map.serialize_entry("id", "")?;
        }
        map.serialize_entry("name", &self.name)?;
        map.serialize_entry("location", &self.location)?;
        map.serialize_entry("po", &self.po)?;
        map.serialize_entry("image", &self.image)?;
        map.serialize_entry("post_date", &self.post_date)?;
        map.end()
    }
}

impl<'de> Deserialize<'de> for LocationListItem {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        #[derive(serde_derive::Deserialize)]
        // Defines an enum for the possible fields in the `LocationListItem` struct
        enum Field {
            Id,
            Name,
            Location,
            Po,
            Image,
            PostDate,
        }

        // Custom visitor for deserializing `LocationListItem`
        struct LocationListItemVisitor;

        impl<'de> Visitor<'de> for LocationListItemVisitor {
            type Value = LocationListItem;

            // Method to define what the visitor expects (used for error reporting)
            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                write!(formatter, "struct LocationListItem")
            }

            // A method to visit the map and deserialize key-value pairs
            fn visit_map<V>(self, mut map: V) -> Result<Self::Value, V::Error>
            where
                V: MapAccess<'de>,
            {
                // Optional variables to temporarily store field values
                let mut id: Option<u64> = None;
                let mut name: Option<String> = None;
                let mut location: Option<String> = None;
                let mut po: Option<String> = None;
                let mut image: Option<String> = None;
                let mut post_date: Option<chrono::DateTime<chrono::Utc>> = None;

                // Loop over the key-value pairs in the map
                while let Some(key) = map.next_key()? {
                    match key {
                        Field::Id => {
                            // Ensure the 'id' field has not already been set
                            if id.is_some() {
                                return Err(serde::de::Error::duplicate_field("id"));
                            } else {
                                // Try to deserialize the 'id' as a u64
                                if let Ok(u64_value) = map.next_value::<u64>() {
                                    id = Some(u64_value);
                                }
                                // Alternatively, try to deserialize as a string and decode it
                                else if let Ok(string_value) = map.next_value::<String>() {
                                    if let Ok(decoded_ids) = decode(string_value.as_str()) {
                                        // Ensure the decoded result contains exactly one element
                                        if decoded_ids.len() != 1 {
                                            return Err(serde::de::Error::custom("Invalid ID"));
                                        }
                                        id = Some(decoded_ids[0]);
                                    } else {
                                        // Error for invalid decoded value
                                        return Err(serde::de::Error::custom(
                                            "Invalid value: expected u64 or a string convertible to u64",
                                        ));
                                    }
                                } else {
                                    // If neither u64 nor string decoding works, report an error
                                    return Err(serde::de::Error::custom(
                                        "Invalid value: expected u64 or string",
                                    ));
                                }
                            }
                        }
                        Field::Name => {
                            // Ensure the 'name' field has not already been set
                            if name.is_some() {
                                return Err(serde::de::Error::duplicate_field("name"));
                            } else {
                                name = Some(map.next_value()?); // Deserialize the 'name' field
                            }
                        }
                        Field::Location => {
                            // Ensure the 'location' field has not already been set
                            if location.is_some() {
                                return Err(serde::de::Error::duplicate_field("location"));
                            } else {
                                location = Some(map.next_value()?); // Deserialize the 'location' field
                            }
                        }
                        Field::Po => {
                            // Ensure the 'po' field has not already been set
                            if po.is_some() {
                                return Err(serde::de::Error::duplicate_field("po"));
                            } else {
                                po = Some(map.next_value()?); // Deserialize the 'po' field
                            }
                        }
                        Field::Image => {
                            // Ensure the 'image' field has not already been set
                            if image.is_some() {
                                return Err(serde::de::Error::duplicate_field("image"));
                            } else {
                                image = Some(map.next_value()?); // Deserialize the 'image' field
                            }
                        }
                        Field::PostDate => {
                            // Ensure the 'post_date' field has not already been set
                            if post_date.is_some() {
                                return Err(serde::de::Error::duplicate_field("post_date"));
                            } else {
                                post_date = Some(map.next_value()?); // Deserialize the 'post_date' field
                            }
                        }
                    }
                }

                // Ensure all required fields were provided
                let name = name.ok_or_else(|| serde::de::Error::missing_field("name"))?;
                let location =
                    location.ok_or_else(|| serde::de::Error::missing_field("location"))?;
                let po = po.ok_or_else(|| serde::de::Error::missing_field("po"))?;
                let image = image.ok_or_else(|| serde::de::Error::missing_field("image"))?;
                let post_date =
                    post_date.ok_or_else(|| serde::de::Error::missing_field("post_date"))?;

                // Build and return the final `LocationListItem` instance
                Ok(LocationListItem {
                    id,
                    name,
                    location,
                    po,
                    image,
                    post_date,
                })
            }
        }

        // Deserialize the `LocationListItem` structure using the custom visitor
        deserializer.deserialize_struct(
            "LocationListItem",                                      // Struct name
            &["id", "name", "location", "po", "image", "post_date"], // Expected fields
            LocationListItemVisitor, // The visitor to handle deserialization
        )
    }
}

impl FromRequest for LocationListItem {
    type Error = actix_web::Error;
    type Future = futures::future::Ready<Result<Self, Self::Error>>;
    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        futures::future::ready(
            serde_urlencoded::from_str::<Self>(req.query_string())
                .map_err(|err| actix_web::error::ErrorBadRequest(err.to_string())),
        )
    }
}
