import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

import "./App.scss";
import { useAuth } from "./auth";
import Deck from "./Deck";
import { UserData } from "./models";

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
      // TODO: Load deck data
      setIsLoading(false);
    }
  }, [auth]);

  if (isLoading) {
    return (
      <div className="mainSpinner">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/deck" element={<Deck />} />
      {/* <Route path="/play" element={<Compare userData={userData} setUserData={setUserData} />} /> */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;