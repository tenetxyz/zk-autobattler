// this is the page for users that are not logged in
import React, {useState} from "react";
import {ForwardAuth, useAuth} from "../auth";

// import classnames from "classnames";
// import css from "./Landing.module.scss";

const Landing: React.FC = () => {
    const auth = useAuth();

    return (
        <ForwardAuth>
            <p>Welcome</p>
        </ForwardAuth>
    );
};

export default Landing;