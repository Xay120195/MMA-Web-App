import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Authentication from "./components/authentication";
import Dashboard from "./components/dashboard";
import MattersOverview from "./components/matters-overview";
import UserAccess from "./components/contact-access";
import MattersAffidavit from "./components/matters-affidavit";
import MattersRFI from "./components/matters-rfi";
import Profile from "./components/user-profile";
import ChangePassword from "./components/change-password";
import PostRegistration from "./components/authentication/post-registration";
import PostAuthentication from "./components/authentication/post-authentication";

import { AppRoutes } from "./constants/AppRoutes";

import Navbar from './components/navigation';

const Routes = () => {
  return (
    <Router>
      
      <Navbar />
      <Switch>
        <Route exact path='/' component={Authentication} />
        <Route exact path={AppRoutes.POSTREGISTRATION} component={PostRegistration} />
        <Route exact path={AppRoutes.POSTAUTHENTICATION} component={PostAuthentication} />
        <Route exact path={AppRoutes.DASHBOARD} component={Dashboard} />
        <Route exact path={`${AppRoutes.MATTERSOVERVIEW}/:id`} component={MattersOverview} />
        <Route exact path={AppRoutes.USERACCESS} component={UserAccess} />
        <Route exact path={`${AppRoutes.MATTERSAFFIDAVIT}/:id`} component={MattersAffidavit} />
        <Route exact path={`${AppRoutes.MATTERSRFI}/:id`} component={MattersRFI} />
        <Route exact path={AppRoutes.PROFILE} component={Profile} />
        <Route exact path={AppRoutes.CHANGEPASSWORD} component={ChangePassword} />
        
      </Switch>
    </Router>
  );
};

export default Routes;
