use std::fs;
fn main() {
    fs::create_dir_all("target/dev-env").expect("failed to create target directory");
    fs::create_dir_all("target/wwwroot").expect("failed to create wwwroot directory");
}
