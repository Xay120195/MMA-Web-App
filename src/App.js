import Routes from "./Routes";
import { withAuthenticator } from "aws-amplify-react";
import "./assets/styles/styles.css";

import Amplify from "@aws-amplify/core";
import PubSub from "@aws-amplify/pubsub";
import awsmobile from "./aws-exports";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Amplify.configure(awsmobile);
PubSub.configure(awsmobile);

function App() {
  return <>
  <Routes />
  <ToastContainer/>
  </>;
}

export default withAuthenticator(App, {
  signUpConfig: {
    hiddenDefaults: ["phone_number"],
  },
});
