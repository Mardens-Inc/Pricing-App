use actix_web::error::HttpError;
use actix_web::http::header::ToStrError;
use actix_web::http::StatusCode;
use actix_web::{HttpResponse, ResponseError};
use anyhow::anyhow;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[allow(dead_code)]
    #[error("an unspecified internal error occurred: {0}")]
    InternalError(anyhow::Error),
    #[allow(dead_code)]
    #[error(transparent)]
    Other(anyhow::Error),
    #[error("an error has occurred: {0:?}")]
    Anyhow(anyhow::Error),
    #[error("unable to parse headers: {0:?}")]
    HeaderParse(ToStrError),
}

impl ResponseError for Error {
    fn status_code(&self) -> StatusCode {
        match &self {
            Self::InternalError(_) | Self::Other(_) => StatusCode::INTERNAL_SERVER_ERROR,
            _ => StatusCode::BAD_REQUEST,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).body(self.to_string())
    }
}

impl From<anyhow::Error> for Error {
    fn from(err: anyhow::Error) -> Self {
        Error::Anyhow(err)
    }
}

impl From<ToStrError> for Error {
    fn from(err: ToStrError) -> Self {
        Error::HeaderParse(err)
    }
}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Self {
        Error::Anyhow(anyhow::Error::new(err))
    }
}

impl From<sqlx::Error> for Error {
    fn from(err: sqlx::Error) -> Self {
        Error::Anyhow(anyhow::Error::new(err))
    }
}
impl From<HttpError> for Error {
    fn from(err: HttpError) -> Self {
        Error::Anyhow(anyhow::Error::new(err))
    }
}

impl From<HttpResponse> for Error {
    fn from(err: HttpResponse) -> Self {
        Error::Anyhow(anyhow!(
            "HTTP response error: {}",
            err.status().canonical_reason().unwrap_or("")
        ))
    }
}

pub type Result<T> = std::result::Result<T, Error>;
