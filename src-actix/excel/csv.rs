use anyhow::Result;
use regex::Regex;

pub fn clean_column_name(name: &str) -> Result<String> {
    let regex = Regex::new(r#"[^a-zA-Z0-9_]"#)?;
    Ok(regex.replace_all(name.trim(), "_").to_string())
}
