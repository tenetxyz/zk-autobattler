use bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

const CARDS_PER_DECK: usize = 5;

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
}

#[derive(Serialize)]
pub struct JoinGameOutput {
    pub lobby_id: String,
    pub error: String
}

#[derive(Hash, Serialize, Deserialize)]
pub struct Card {
    pub health: u32,
    pub attack: u32,
}

#[derive(Hash, Serialize, Deserialize)]
pub struct Deck {
    pub cards: [Card; CARDS_PER_DECK],
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
    pub player1_id: String,
    pub player2_id: String,
    pub lobby_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct Game {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    id: Option<ObjectId>,
    pub player1_id: String,
    pub player2_id: String,
    pub lobby_id: String,
    pub creation1: Deck,
    pub creation1_hash: String,
    pub creation2: Deck,
    pub creation2_hash: String,
    pub arena_hash: String,
    pub winner_creation_hash: String,
    pub winner_id: String,
    pub state: String,
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