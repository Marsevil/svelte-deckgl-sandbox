use duckdb::Error as DBError;
use rocket::http::Status;
use rocket::response::Responder;
use rocket::{response, Request};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum InternalError {
    #[error(transparent)]
    DBError(#[from] DBError),
    #[error("No result from the database")]
    EmptyResult,
}

impl<'r, 'o: 'r> Responder<'r, 'o> for InternalError {
    fn respond_to(self, req: &'r Request<'_>) -> response::Result<'o> {
        println!("ERROR : {self:?}");

        match self {
            _ => Status::InternalServerError.respond_to(req),
        }
    }
}
