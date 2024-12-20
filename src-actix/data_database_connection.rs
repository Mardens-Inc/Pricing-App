use serde::Deserialize;

#[derive(Deserialize, Clone)]
pub struct DatabaseConnectionData {
    pub host: String,
    pub user: String,
    pub password: String,
}

impl DatabaseConnectionData {
    pub async fn get() -> Result<Self, Box<dyn std::error::Error>> {
        use reqwest::Client;
        let url = "https://lib.mardens.com/config.json";
        let client = Client::builder()
            .danger_accept_invalid_certs(true)
            .build()?;
        let response = client.get(url).send().await?;
        let credentials = response.json::<DatabaseConnectionData>().await?;
        Ok(credentials)
    }
}
