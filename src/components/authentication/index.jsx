import React from 'react';
import { Redirect } from "react-router-dom";
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import '../../assets/styles/Auth.css'

const Authentication = () => {
    const [authState, setAuthState] = React.useState();
    const [user, setUser] = React.useState();

    React.useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            setAuthState(nextAuthState);
            setUser(authData)
        });
    }, []);

  return authState === AuthState.SignedIn && user ? (
      <>
        <Redirect to="/dashboard" />
      </>
    ) : (

        <figure class="md:flex bg-gray-100 rounded-xl p-8 md:p-0">
            <div class="pt-6 md:p-8 text-center md:text-left space-y-4">
                <p> Test </p>
                </div>
            <div class="pt-6 md:p-8 text-center md:text-left space-y-4">

      <AmplifyAuthenticator>
        <AmplifySignIn 
          slot="sign-in" 
          usernameAlias="email"  
          headerText="My Custom Sign In Text"
        />
        <AmplifySignUp
          slot="sign-up"
          formFields={[
            { type: "username" },
            { type: "password" },
            { type: "email" }
          ]}
        />
      </AmplifyAuthenticator>
      </div>
      </figure>
  );
}

export default Authentication;