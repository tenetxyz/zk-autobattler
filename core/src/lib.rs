use serde::{Deserialize, Serialize};

pub const CARDS_PER_DECK: usize = 5;

#[derive(Hash, Serialize, Deserialize)]
pub struct Card {
    pub health: u32,
    pub attack: u32,
}

#[derive(Hash, Serialize, Deserialize)]
pub struct Deck {
    pub cards: [Card; CARDS_PER_DECK],
}
