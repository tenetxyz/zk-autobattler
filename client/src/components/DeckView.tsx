import React, { useEffect, useState } from "react";
import { Card as RBCard, Form, Col, Row, Button } from "react-bootstrap";

// CSS
import "../styles/DeckView.scss";
import { Card, Deck, UserData } from "../models";

interface DeckViewProps {
    cards: Card[],
    onHealthValueChange: any,
    onAttackValueChange: any,
    disabled: boolean,
    errorMsg: any,
}

function DeckView(props: DeckViewProps) {
  const filterNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(!e.key.match(/^\d+$/)){
      e.preventDefault();
    }
  }

  return (
    <div className="cardsContainer">
      {props.cards.map((card: Card, index) => {
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
                <Form.Control id={"card-health-" + index} disabled={props.disabled} min="0" autoComplete="off" className="cardValue" type="number" value={card.health === undefined ? "" : card.health} onKeyPress={filterNumbers} onChange={props.onHealthValueChange} placeholder="0" />
              </div>
              <div className="cardField">
                <p className="cardKey">Attack</p>
                <Form.Control id={"card-attack-" + index} disabled={props.disabled} min="0" autoComplete="off" className="cardValue" type="number" value={card.attack === undefined ? "" : card.attack} onKeyPress={filterNumbers} onChange={props.onAttackValueChange} placeholder="0" />
              </div>
            </div>
            {props.errorMsg && props.errorMsg[index] && <p className="errorMsg" style={{marginTop: "10px"}}>{props.errorMsg[index]}</p>}
          </RBCard.Body>
        </RBCard>
        )
      })}
    </div>
  );
}

export default DeckView;
