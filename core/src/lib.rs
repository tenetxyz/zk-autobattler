use serde::{Deserialize, Serialize};
use std::hash::{Hash, Hasher};

pub const CARDS_PER_DECK: usize = 5;

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Card {
    pub health: u32,
    pub attack: u32,
}

impl Hash for Card {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.health.hash(state);
        self.attack.hash(state);
    }
}


#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Deck {
    pub cards: [Card; CARDS_PER_DECK],
}

impl Hash for Deck {
    fn hash<H: Hasher>(&self, state: &mut H) {
        for card in self.cards {
            card.hash(state);
        }
    }
}

#[derive(Debug, Hash, Serialize, Deserialize)]
pub struct GameResult {
    pub player1_id: String,
    pub player2_id: String,
    pub creation1_hash: String,
    pub creation2_hash: String,
    pub winner_creation_hash: String,
    pub winner_id: String,
    pub result: String,
}
