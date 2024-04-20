use rocket::Responder;

#[derive(Responder)]
#[response(content_type = "binary")]
pub struct BinaryData(Vec<u8>);

impl From<Vec<u8>> for BinaryData {
    fn from(value: Vec<u8>) -> Self {
        Self(value)
    }
}

impl From<BinaryData> for Vec<u8> {
    fn from(value: BinaryData) -> Self {
        value.0
    }
}
