use serde::Serialize;
use serde_derive::Deserialize;

#[derive(Serialize, Deserialize)]
pub struct InventoryOptions {
    #[serde(rename = "print-form")]
    pub print_form: Option<PrintForm>,
    pub inventorying: Option<Inventorying>,
}
#[derive(Serialize, Deserialize)]
pub struct Inventorying {
    #[serde(rename = "add-if-missing")]
    pub add_if_missing: bool,
    #[serde(rename = "remove-if-zero")]
    pub remove_if_zero: bool,
    #[serde(rename = "allow-additions")]
    pub allow_additions: bool,
}

#[derive(Serialize, Deserialize)]
pub struct PrintForm {
    pub year: Option<u8>,
    pub label: Option<String>,
    #[serde(rename = "show-retail")]
    pub show_retail: bool,
    #[serde(rename = "show-price-label")]
    pub show_price_label: bool,
}
