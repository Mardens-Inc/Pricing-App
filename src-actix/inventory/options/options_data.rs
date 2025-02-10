use crate::print_options_data::PrintForm;
use serde::Serialize;
use serde_derive::Deserialize;

#[derive(Serialize, Deserialize)]
pub struct InventoryOptions {
    pub print_form: Option<Vec<PrintForm>>,
    pub inventorying: Option<Inventorying>,
    pub show_year_input: bool,
    pub show_color_dropdown: bool,
    pub show_department_dropdown: bool,
}
#[derive(Serialize, Deserialize)]
pub struct Inventorying {
    pub add_if_missing: bool,
    pub remove_if_zero: bool,
    pub allow_additions: bool,
}
