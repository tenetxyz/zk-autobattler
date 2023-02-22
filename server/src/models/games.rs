use bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use tenet_core::Deck;

// the input to our `create_user` handler
#[derive(Deserialize)]
pub struct FactorsInput {
    pub a: u64,
    pub b: u64,
}

#[derive(Deserialize)]
pub struct JoinGameInput {
    pub player_id: String,
    pub lobby_id: String, // TODO: Make this optional
    pub create_new: bool,
}

#[derive(Serialize)]
pub struct GetGamesOutput {
    pub games: Vec<Game>,
    pub error: String,
}


#[derive(Serialize)]
pub struct JoinGameOutput {
    pub lobby_id: String,
    pub error: String
}

#[derive(Deserialize)]
pub struct PlayGameInput {
    pub lobby_id: String,
    pub player_id: String,
    pub creation: Deck,
}
#[derive(Serialize)]
pub struct PlayGameOutput {
    pub error: String,
}

#[derive(Serialize, Deserialize)]
pub struct Lobby {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    id: Option<ObjectId>,
    pub player1_id: Option<String>,
    pub player2_id: Option<String>,
    pub lobby_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub player1_id: String,
    pub player2_id: String,
    pub lobby_id: String,
    pub creation1: Option<Deck>,
    pub creation1_hash: Option<String>,
    pub creation2: Option<Deck>,
    pub creation2_hash: Option<String>,
    pub arena_hash: String,
    pub winner_creation_hash: Option<String>,
    pub winner_id: Option<String>,
    pub state: String,
    pub result: Option<String>,
}

#[derive(Deserialize)]
pub struct CommitOutcomeInput {
    pub player_id: String,
}

#[derive(Deserialize, Serialize)]
pub struct Receipt {
    pub journal: Vec<u8>,
    pub seal: Vec<u32>,
}

#[derive(Deserialize)]
pub struct PlayerInfo {
    pub player_id: String,
}

#[derive(Serialize)]
pub struct PlayerGamesOutput {
    pub games: Vec<Game>,
    pub error: String,
}
