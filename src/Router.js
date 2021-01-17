import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import WelcomeScreen from "./WelcomeScreen";
import ChatScreen from "./ChatScreen";
import SpeechToText from "./SpeechToText";

function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/chat" component={ChatScreen} />
        <Route path="/rooms" component={WelcomeScreen} />
        <Route path="/" component={SpeechToText} />
      </Switch>
    </BrowserRouter>
  );
}

export default Router;