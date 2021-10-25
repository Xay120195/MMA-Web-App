import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Navigation from "./components/Navigation";

import SavedEmails from "./modules/saved";
import Email from "./modules/email";
import Settings from "./modules/settings";
import ConnectEmail from "./modules/connect_email";
import Management from "./modules/access_control";

const Routes = () => {
  return (
    <Router>
      <Navigation />
      <Switch>
        <Route exact path="/" component={Email} />
        <Route exact path="/saved" component={SavedEmails} />
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/connect_email" component={ConnectEmail} />
        <Route path="/access_control" component={Management} />
      </Switch>
    </Router>
  );
};

export default Routes;
