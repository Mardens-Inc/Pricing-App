use serde::Serialize;
use serde_derive::Deserialize;
use crate::print_options_data::PrintForm;

#[derive(Serialize, Deserialize)]
pub struct InventoryOptions {
    #[serde(rename = "print-form")]
    pub print_form: Option<Vec<PrintForm>>,
    pub inventorying: Option<Inventorying>,
    pub show_year_input: bool,
    pub show_color_dropdown: bool,
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

