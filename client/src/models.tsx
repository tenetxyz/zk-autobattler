export type Card = {
    health: number;
    attack: number;
}

export type Deck = {
    // TODO: Set a limit on the number of cards in a deck
    cards: Card[];
};

export type UserData = {
  decks: Deck[];
};
