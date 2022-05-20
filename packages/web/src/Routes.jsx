import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Authentication from "./components/authentication";
import Dashboard from "./components/dashboard";
import MattersOverview from "./components/matters-overview";
import UserTypeAccess from "./components/usertype-access";
import AccountSettings from "./components/account-settings";
import MattersRFI from "./components/matters-rfi-page";
import Contacts from "./components/contacts";
import PostRegistration from "./components/authentication/post-registration";
import PostAuthentication from "./components/authentication/post-authentication";
import { AppRoutes } from "./constants/AppRoutes";
import Navbar from "./components/navigation";
import Signout from "./components/authentication/signout";
import FileBucket from "./components/file-bucket";
import Background from "./components/background";
import Labels from "./components/labels";
import Inbox from "./components/inbox";
import RFIPage from "./components/rfi-page";
import Briefs from "./components/briefs";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Authentication} />
        <Route exact path={AppRoutes.SIGNOUT} component={Signout} />
        <Route
          exact
          path={AppRoutes.POSTREGISTRATION}
          component={PostRegistration}
        />
        <Route
          exact
          path={AppRoutes.POSTAUTHENTICATION}
          component={PostAuthentication}
        />
        <>
          <Navbar />
          <Route exact path={AppRoutes.DASHBOARD} component={Dashboard} />
          <Route
            exact
            path={`${AppRoutes.MATTERSOVERVIEW}/:id`}
            component={MattersOverview}
          />
          <Route
            exact
            path={AppRoutes.USERTYPEACCESS}
            component={UserTypeAccess}
          />
          <Route
            exact
            path={`${AppRoutes.MATTERSRFI}/:matter_id`}
            component={MattersRFI}
          />
          <Route
            exact
            path={`${AppRoutes.RFIPAGE}/:matter_id`}
            component={RFIPage}
          />
          <Route exact path={AppRoutes.CONTACTS} component={Contacts} />
          <Route
            exact
            path={AppRoutes.ACCOUNTSETTINGS}
            component={AccountSettings}
          />
          <Route
            exact
            path={`${AppRoutes.FILEBUCKET}/:matter_id/:background_id`}
            component={FileBucket}
          />
          <Route
            exact
            path={`${AppRoutes.BACKGROUND}/:matter_id/:background_id`}
            component={Background}
          />
          <Route
            exact
            path={`${AppRoutes.BRIEFS}/:matter_id`}
            component={Briefs}
          />

          <Route exact path={AppRoutes.LABELS} component={Labels} />
          <Route exact path={`${AppRoutes.INBOX}`} component={Inbox} />
        </>
      </Switch>
    </Router>
  );
};

export default Routes;
