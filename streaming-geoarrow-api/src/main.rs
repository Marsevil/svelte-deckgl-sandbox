pub mod cors;
pub mod error;
pub mod model;

#[macro_use]
extern crate rocket;

use duckdb::Connection;

use crate::cors::CORS;
use crate::error::InternalError;
use crate::model::BinaryData;

#[get("/ping")]
fn ping() -> &'static str {
    "Pong !"
}

#[get("/arrow")]
fn arrow() -> Result<BinaryData, InternalError> {
    const REQ: &'static str = r#"
        select geometry as geometry
        from './data/example.parquet'
        where iso_a3 = 'TZA';
    "#;

    let db = Connection::open_in_memory()?;
    let mut stmt = db.prepare(REQ)?;
    let data = stmt.query_map([], |row| {
        Ok(BinaryData::from(row.get::<_, Vec<u8>>("geometry")?))
    })?;

    data.last()
        .ok_or(InternalError::EmptyResult)
        .map(|e| e.map_err(|err| err.into()))
        .and_then(|e| e)
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    rocket::build()
        .attach(CORS)
        .mount("/", routes![ping])
        .mount("/", routes![arrow])
        .launch()
        .await?;

    Ok(())
}
