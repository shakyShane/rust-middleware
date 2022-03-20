#[derive(Debug)]
pub struct StartResult {
    pub status: String
}

impl StartResult {
    fn ok() -> Self {
        Self { status: "OK".to_string() }
    }
}

pub fn start() -> Result<StartResult, String> {
    Ok(StartResult::ok())
}
