import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "./auth";
import "./Header.scss";

type HeaderProps = {};

function Header(props: HeaderProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageItems = () => {
    if (location.pathname === "/deck") {
      return (
        <p className="headerItem" onClick={() => navigate("/play")}>
          Play
        </p>
      );
    } else if (location.pathname === "/play") {
      return <p className="headerItem"  onClick={() => navigate("/deck")}>Leaderboard</p>;
    }
    return null;
  };

  const getAuthButton = () => {
      if (location.pathname === "/") {
        return (
          <p className="headerItem" onClick={() =>   auth.signIn(()=>{ console.log("here"); navigate("/deck"); }, (err:any) => console.error(`cannot authenticate ${err}`))}>
            Login
          </p>
        );
      }
      return (
        <p className="headerItem" onClick={() =>  auth.signout(
          () => {},
          (err: any) => console.error(`cannot authenticate ${err}`)
        )}>
          Logout
        </p>
      );
    };


  return (
    <div className="headerContainer">
      <div className="leftHeader">
        <div className="appHeader" onClick={() => navigate("/play")}>
          <svg width="45px" height="45px" strokeWidth="1.5" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M21 7.353v9.294a.6.6 0 01-.309.525l-8.4 4.666a.6.6 0 01-.582 0l-8.4-4.666A.6.6 0 013 16.647V7.353a.6.6 0 01.309-.524l8.4-4.667a.6.6 0 01.582 0l8.4 4.667a.6.6 0 01.309.524z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M3.528 7.294l8.18 4.544a.6.6 0 00.583 0l8.209-4.56M12 21v-9" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M11.691 11.829l-7.8-4.334A.6.6 0 003 8.02v8.627a.6.6 0 00.309.525l7.8 4.333A.6.6 0 0012 20.98v-8.627a.6.6 0 00-.309-.524z" fill="#000000" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"></path></svg>
          <p className="appName">zk Auto Battler</p>
        </div>
        {getPageItems()}
      </div>
      <div className="rightHeader">
       {getAuthButton()}
      </div>
    </div>
  );
}

export default Header;