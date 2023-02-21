import React, { useEffect, useState } from "react";
import { Card as RBCard, Form, Col, Row, Button } from "react-bootstrap";

// CSS

import "./Deck.scss";
import { Card } from "./models";

interface DeckProps {}

function Deck(props: DeckProps) {
  const [cards, setCards] = useState<Card[]>([
    {
      health: undefined,
      attack: undefined,
    },
    {
      health: undefined,
      attack: undefined,
    }
  ]);


  const parseNumber = (value: string) => {
    let newValue = undefined;
    if(value !== ""){
      newValue = parseInt(value);
    }
    return newValue;
  }

  const onHealthValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseNumber(e.target.value);
    let cardId = parseInt(e.target.id.split("-")[2]);
    let newCards = [...cards];
    newCards[cardId].health = newValue;
    setCards(newCards);
  }

  const onAttackValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseNumber(e.target.value);
    let cardId = parseInt(e.target.id.split("-")[2]);
    let newCards = [...cards];
    newCards[cardId].attack = newValue;
    setCards(newCards);
  }

  const filterNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(!e.key.match(/^\d+$/)){
      e.preventDefault();
    }
  }

  console.log("rendering");
  return (
    <div className="cardsContainer">
      {cards.map((card, index) => {
        return (
          <RBCard
          key={"card-" + index}
          bg={"light"}
          text={"dark"}
          style={{ width: "18rem" }}
          className="mb-2"
        >
          <RBCard.Header>Card {index + 1}</RBCard.Header>
          <RBCard.Body>
            <div className="cardEdit">
              <div className="cardField">
                <p className="cardKey">Health</p>
                <Form.Control id={"card-health-" + index} min="0" autoComplete="off" className="cardValue" type="number" value={card.health === undefined ? "" : card.health} onKeyPress={filterNumbers} onChange={onHealthValueChange} placeholder="0" />
              </div>
              <div className="cardField">
                <p className="cardKey">Attack</p>
                <Form.Control id={"card-attack-" + index} min="0" autoComplete="off" className="cardValue" type="number" value={card.attack === undefined ? "" : card.attack} onKeyPress={filterNumbers} onChange={onAttackValueChange} placeholder="0" />
              </div>
              <div className="cardButton">
                <Button variant="primary">Save</Button>
              </div>
            </div>
          </RBCard.Body>
        </RBCard>
        )
      })}
    </div>
  );
}

export default Deck;
