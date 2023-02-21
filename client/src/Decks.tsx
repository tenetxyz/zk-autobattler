import React, { useEffect, useState } from "react";
import { Card as RBCard, Form, Col, Row, Button } from "react-bootstrap";

// CSS
import "./Decks.scss";
import { Card, Deck, UserData } from "./models";

interface DecksProps {
  userData: UserData | null;
}

function Decks(props: DecksProps) {
  const [cards, setCards] = useState<Card[]>([
    {
      health: undefined,
      attack: undefined,
    },
    {
      health: undefined,
      attack: undefined,
    },
    {
      health: undefined,
      attack: undefined,
    },
    {
      health: undefined,
      attack: undefined,
    },
    {
      health: undefined,
      attack: undefined,
    }
  ]);
  const [modified, setModified] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string[]>(Array(cards.length).fill(""));

  useEffect(() => {
    if(props.userData){
      setCards(props.userData.decks[0].cards);
    }
  }, [props.userData])


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
    setModified(true);
    let newErrorMsgs = [...errorMsg];
    newErrorMsgs[cardId] = "";
    setErrorMsg(newErrorMsgs);
  }

  const onAttackValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseNumber(e.target.value);
    let cardId = parseInt(e.target.id.split("-")[2]);
    let newCards = [...cards];
    newCards[cardId].attack = newValue;
    setCards(newCards);
    setModified(true);
    let newErrorMsgs = [...errorMsg];
    newErrorMsgs[cardId] = "";
    setErrorMsg(newErrorMsgs);
  }

  const filterNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(!e.key.match(/^\d+$/)){
      e.preventDefault();
    }
  }

  const validateCards = (cards: Card[]) => {
    let isValid = true;
    let newErrorMsgs = [...errorMsg];
    cards.forEach((card, index) => {
      if(card.health === undefined || card.attack === undefined){
        newErrorMsgs[index] = "All cards must have a health and attack value.";
        isValid = false;
      } else {
        if(card.health === 0){
          newErrorMsgs[index] = "A card's health cannot be 0.";
          isValid = false;
        }
        let sum = card.health + card.attack;
        if(sum !== 10){
          newErrorMsgs[index] = "The sum of a card's health and attack must equal 10.";
          isValid = false;
        }
      }
    });
    setErrorMsg(newErrorMsgs);
    return isValid;
  }

  const saveCardClicked = () => {
    if(validateCards(cards)){
      let playerDeck: Deck = {
        cards: cards
      }
      localStorage.setItem("playerDeck", JSON.stringify(playerDeck));
      setModified(false);
    }
  }

  return (
    <div className="decksContainer">
      <div className="headerWrapper">
      <p className="pageHeader">Your Deck</p>
      {modified && <div className="cardButton">
                <Button variant="primary" onClick={saveCardClicked}>Save</Button>
      </div>}
      </div>
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
            </div>
            {errorMsg[index] && <p className="errorMsg">{errorMsg[index]}</p>}
          </RBCard.Body>
        </RBCard>
        )
      })}
    </div>
    </div>
  );
}

export default Decks;
