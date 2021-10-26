import React from 'react';
import Routes from './Routes';

import Amplify from "@aws-amplify/core";
import PubSub from "@aws-amplify/pubsub";
import awsmobile from "./aws-exports";

Amplify.configure(awsmobile);
PubSub.configure(awsmobile);

function App() {
  return <Routes />;
}

export default App;