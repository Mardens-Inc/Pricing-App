use std::path::Path;

pub static DEBUG: bool = cfg!(debug_assertions);
pub const PORT: u16 = 1421;
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const UPLOAD_FOLDER: &str = "uploads";
pub const ICONS_FOLDER: &str = "icons";

/// Creates necessary asset directories for the application
///
/// # Description
/// Initializes the upload directory structure required for storing uploaded files.
/// Creates the main upload directory if it doesn't exist.
///
/// # Returns
/// - `Ok(())` if directories were created successfully
/// - `Err(anyhow::Error)` if directory creation fails
///
/// # Errors
/// This function will return an error if:
/// - The program lacks permissions to create directories
/// - The path already exists but is not a directory
/// - Other filesystem-related errors occur
pub fn initialize_asset_directories() -> anyhow::Result<()> {
    if DEBUG {
        std::fs::create_dir_all("target/dev-env")?;
        std::env::set_current_dir(Path::new("target/dev-env"))
            .expect("Failed to set current directory");
    }

    std::fs::create_dir_all(UPLOAD_FOLDER)?;
    std::fs::create_dir_all(ICONS_FOLDER)?;

    Ok(())
}
