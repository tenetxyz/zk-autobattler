import React, { useEffect, useState } from "react";
import { ForwardAuth, useAuth } from "../auth";
import { UserData } from "../models";
import { apiFetch } from "../utils";

import "../styles/Play.scss";

interface PlayProps {
  userData: UserData | null;
}

function Play(props: PlayProps) {
  const auth = useAuth();


  return (
    <div className="pageContainer">
      <div className="pageHeaderWrapper">
        <p className="pageHeader">Play</p>
        {/* {isLoading && <Spinner style={{marginLeft: "20px"}} animation="border" variant={"light"} />} */}
      </div>
    </div>
  );
}

export default Play;
