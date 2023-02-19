use serde::{Deserialize, Serialize};

// the input to our `create_user` handler
#[derive(Deserialize)]
pub struct FactorsInput {
    pub a: u64,
    pub b: u64,
}

#[derive(Deserialize)]
pub struct JoinGameInput {
    pub playerId: String,
    pub lobbyId: String, // TODO: Make this optional
}

#[derive(Serialize)]
pub struct JoinGameOutput {
    pub lobbyId: String,
    pub error: String
}

#[derive(Deserialize)]
pub struct PlayGameInput {
    pub playerId: String,
}

#[derive(Deserialize)]
pub struct CommitOutcomeInput {
    pub playerId: String,
}

#[derive(Deserialize, Serialize)]
pub struct Receipt {
    pub journal: Vec<u8>,
    pub seal: Vec<u32>,
}