import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Authentication from "./components/authentication";
import Dashboard from "./components/dashboard";
import MattersOverview from "./components/matters-overview";
import UserTypeAccess from "./components/usertype-access";
import AccountSettings from "./components/account-settings";
import WitnessAffidavit from "./components/witness-affidavit";
import MattersRFI from "./components/matters-rfi";
import Profile from "./components/user-profile";
import ChangePassword from "./components/change-password";
import PostRegistration from "./components/authentication/post-registration";
import PostAuthentication from "./components/authentication/post-authentication";
import { AppRoutes } from "./constants/AppRoutes";
import Navbar from "./components/navigation";
import Signout from "./components/authentication/signout";


const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Authentication} />
        <Route exact path={AppRoutes.SIGNOUT} component={Signout} />
        <Route exact path={AppRoutes.POSTREGISTRATION} component={PostRegistration} />
        <Route exact path={AppRoutes.POSTAUTHENTICATION} component={PostAuthentication} />
        <>
          <Navbar />
          <Route exact path={AppRoutes.DASHBOARD} component={Dashboard} />
          <Route exact path={`${AppRoutes.MATTERSOVERVIEW}/:id`} component={MattersOverview} />
          <Route exact path={AppRoutes.USERTYPEACCESS} component={UserTypeAccess} />
          <Route exact path={`${AppRoutes.WITNESSAFFIDAVIT}/:id`} component={WitnessAffidavit} />
          <Route exact path={`${AppRoutes.MATTERSRFI}/:id`} component={MattersRFI} />
          <Route exact path={AppRoutes.PROFILE} component={Profile} />
          <Route exact path={AppRoutes.ACCOUNTSETTINGS} component={AccountSettings} />
          <Route exact path={AppRoutes.CHANGEPASSWORD} component={ChangePassword} />
        </>
      </Switch>
    </Router>
  );
};

export default Routes;
