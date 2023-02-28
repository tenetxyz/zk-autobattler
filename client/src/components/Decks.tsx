import React, { useEffect, useState } from "react";
import { Card as RBCard, Form, Col, Row, Button } from "react-bootstrap";

// CSS
import "../styles/Decks.scss";
import { Card, Deck, UserData } from "../models";
import DeckView from "./DeckView";

interface DecksProps {
  userData: UserData | null;
  setUserData: any;
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
    },
  ]);
  const [modified, setModified] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string[]>(
    Array(cards.length).fill("")
  );

  useEffect(() => {
    if (props.userData) {
      if(props.userData.decks.length > 0){
        setCards(props.userData.decks[0].cards);
      }
    }
  }, [props.userData]);

  const parseNumber = (value: string) => {
    let newValue = undefined;
    if (value !== "") {
      newValue = parseInt(value);
    }
    return newValue;
  };

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
  };

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
  };

  const filterNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e.key.match(/^\d+$/)) {
      e.preventDefault();
    }
  };

  const validateCards = (cards: Card[]) => {
    let isValid = true;
    let newErrorMsgs = [...errorMsg];
    cards.forEach((card, index) => {
      if (card.health === undefined || card.attack === undefined) {
        newErrorMsgs[index] = "All cards must have a health and attack value.";
        isValid = false;
      } else {
        if (card.health === 0) {
          newErrorMsgs[index] = "A card's health cannot be 0.";
          isValid = false;
        }
        let sum = card.health + card.attack;
        if (sum !== 10) {
          newErrorMsgs[index] =
            "The sum of a card's health and attack must equal 10.";
          isValid = false;
        }
      }
    });
    setErrorMsg(newErrorMsgs);
    return isValid;
  };

  const saveCardClicked = () => {
    if (validateCards(cards)) {
      let playerDeck: Deck = {
        name: "Player Deck",
        type: "BASIC_5",
        cards: cards,
      };
      localStorage.setItem("playerDeck", JSON.stringify(playerDeck));
      if (props.userData) {
        let newUserData: UserData | null = { ...props.userData };
        newUserData.decks[0] = playerDeck;
        props.setUserData(newUserData);
      }
      setModified(false);
    }
  };

  return (
    <div className="pageContainer">
      <div className="pageHeaderWrapper">
        <p className="pageHeader">Your Deck</p>
        {modified && (
          <div className="cardButton">
            <Button variant="primary" onClick={saveCardClicked}>
              Save
            </Button>
          </div>
        )}
      </div>
      <DeckView
        cards={cards}
        onHealthValueChange={onHealthValueChange}
        onAttackValueChange={onAttackValueChange}
        disabled={false}
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default Decks;
