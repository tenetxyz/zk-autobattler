import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

import "./App.scss";
import { useAuth } from "./auth";
import Decks from "./components/Decks";
import Study from "./components/Study";

import { Deck, UserData } from "./models";
import Play from "./components/Play";
import Creations from "./components/Creations";

// CSS

function PageNotFound() {
  return (
    <main style={{ padding: "1rem" }}>
      <p>There's nothing here!</p>
    </main>
  );
}

interface AppProps {}

function App(props: AppProps) {
  const auth = useAuth();
  let [userData, setUserData] = useState<UserData | null>(null);
  let [isLoading, setIsLoading] = useState<any>(true);

  useEffect(() => {
    if (auth && !auth.isLoading && auth.user) {
      let userCreations: string | null = localStorage.getItem("userCreations");
      if (userCreations) {
        let savedUserData: UserData = JSON.parse(userCreations);
        setUserData(savedUserData);
      }
      setIsLoading(false);
    }
  }, [auth]);

  const saveUserData = (newUserData: UserData) => {
    setUserData(newUserData);
    localStorage.setItem("userCreations", JSON.stringify(newUserData));
  }

  if (isLoading) {
    return (
      <div className="mainSpinner">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/creations" element={<Creations userData={userData} saveUserData={saveUserData} />} />
      <Route path="/study" element={<Study userData={userData} />} />
      <Route path="/play" element={<Play userData={userData} />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;