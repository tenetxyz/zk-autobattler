use serde::{Deserialize, Serialize};

pub const CARDS_PER_DECK: usize = 5;

#[derive(Clone, Copy, Hash, Serialize, Deserialize)]
pub struct Card {
    pub health: u32,
    pub attack: u32,
}

#[derive(Clone, Copy, Hash, Serialize, Deserialize)]
pub struct Deck {
    pub cards: [Card; CARDS_PER_DECK],
}

#[derive(Hash, Serialize, Deserialize)]
pub struct GameResult {
    pub player1_id: String,
    pub player2_id: String,
    pub creation1_hash: String,
    pub creation2_hash: String,
    pub winner_creation_hash: String,
    pub winner_id: String,
    pub result: String,
}
