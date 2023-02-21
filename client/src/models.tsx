export type Card = {
    health: number | undefined;
    attack: number | undefined;
}

export type Deck = {
    // TODO: Set a limit on the number of cards in a deck
    cards: Card[];
};

export type UserData = {
  decks: Deck[];
};

export type NPC = {
  name: string;
  deck: Deck;
}