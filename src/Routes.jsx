import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Authentication from "./components/authentication";
import Dashboard from "./components/dashboard";
import { AppRoutes } from "./constants/AppRoutes";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Authentication} />
        <Route exact path={AppRoutes.DASHBOARD} component={Dashboard} />
      </Switch>
    </Router>
  );
};

export default Routes;
