use serde_derive::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PrintForm {
    pub id: Option<u64>,
    pub hint: Option<String>,
    pub label: Option<String>,
    pub year: Option<u8>,
    pub department: Option<u8>,
    pub color: Option<String>,
    pub size: Option<String>,
    #[serde(rename = "show-retail")]
    pub show_retail: bool,
    #[serde(rename = "show-price-label")]
    pub show_price_label: bool,
}
