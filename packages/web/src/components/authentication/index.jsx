import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  AmplifyAuthenticator,
  AmplifySignUp,
  AmplifySignIn,
  AmplifyForgotPassword,
} from "@aws-amplify/ui-react";
import { I18n } from "aws-amplify";
import {
  AuthState,
  onAuthUIStateChange,
  Translations,
} from "@aws-amplify/ui-components";
import "../../assets/styles/Auth.css";
import { Disclosure } from "@headlessui/react";
import { AuthFields } from "../../constants/AuthFields";
import { AuthLabels } from "../../constants/AuthLabels";
import { AppRoutes } from "../../constants/AppRoutes";

I18n.setLanguage("en-AU");
I18n.putVocabulariesForLanguage("en-AU", {
  [Translations.CONFIRM_SIGN_UP_CODE_LABEL]:
    AuthLabels.CONFIRM_SIGN_UP_CODE_LABEL,
  [Translations.CONFIRM_SIGN_UP_CODE_PLACEHOLDER]:
    AuthLabels.CONFIRM_SIGN_UP_CODE_PLACEHOLDER,
  [Translations.CONFIRM_SIGN_UP_HEADER_TEXT]:
    AuthLabels.CONFIRM_SIGN_UP_HEADER_TEXT,
  [Translations.CONFIRM_SIGN_UP_LOST_CODE]:
    AuthLabels.CONFIRM_SIGN_UP_LOST_CODE,
  [Translations.BACK_TO_SIGN_IN]: AuthLabels.BACK_TO_SIGN_IN,
  [Translations.SIGN_IN_ACTION]: AuthLabels.SIGN_IN_ACTION,
  [Translations.SIGN_IN_TEXT]: AuthLabels.SIGN_IN_TEXT,
  [Translations.SIGN_UP_SUBMIT_BUTTON_TEXT]:
    AuthLabels.SIGN_UP_SUBMIT_BUTTON_TEXT,
  [Translations.CREATE_ACCOUNT_TEXT]: AuthLabels.CREATE_ACCOUNT_TEXT,
});

const navigation = [
  { name: "Contact", href: "/contact", current: false },
  { name: "Login", href: "/#login", current: true },
  { name: "Signup", href: "/#signup", current: false },
];

const Authentication = () => {
  const [authState, setAuthState] = useState(AuthState.SignIn);
  const [prevAuthState, setPrevAuthState] = useState();
  const [user, setUser] = useState();
  const [customCompanyName, setCustomCompanyName] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();

  let history = useHistory();

  useEffect(() => {
    clearLocalStorage();
    return onAuthUIStateChange((nextAuthState, authData) => {
      console.log(authState, nextAuthState);
      if (authState !== nextAuthState) {
        setPrevAuthState(nextAuthState);
      }

      if (prevAuthState === undefined) {
        setPrevAuthState(nextAuthState);
      }

      setAuthState(nextAuthState);
      setUser(authData);
      

      if (prevAuthState === "confirmSignUp" && nextAuthState === "signedin") {
        history.push(AppRoutes.POSTREGISTRATION);
      } else if (nextAuthState === "signedin") {
        history.push(AppRoutes.POSTAUTHENTICATION);
      }
      console.log(authState, prevAuthState);
    });
  }, [authState, prevAuthState, history]);

  function clean_up(v) {
    let c = v.replace(/\s+/g, " ");
    if (c === " ") {
      c = "";
    }

    return c;
  }

  function clearLocalStorage() {
    console.log('clearLocalStorage');
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("userType");
    localStorage.removeItem("company");
    localStorage.removeItem("companyId");
    localStorage.removeItem("access");
  }

  const signUpFields = [
    {
      type: "given_name",
      key: "given_name",
      label: "First Name",
      autoComplete: "off",
      placeholder: "",
      required: true,
      value: firstName,
      handleInputChange: (event) => {
        let i = clean_up(event.target.value);
        setFirstName(i);
        event.target.value = i;
      },
    },
    {
      type: "family_name",
      key: "family_name",
      label: "Last Name",
      autoComplete: "off",
      placeholder: "",
      required: true,
      value: lastName,
      handleInputChange: (event) => {
        let i = clean_up(event.target.value);
        setLastName(i);
        event.target.value = i;
      },
    },
    {
      type: "custom:company_name",
      key: "custom:company_name",
      label: "Company Name",
      autoComplete: "off",
      placeholder: "",
      required: true,
      value: customCompanyName,
      handleInputChange: (event) => {
        let i = clean_up(event.target.value);
        setCustomCompanyName(i);
        event.target.value = i;
      },
    },
    {
      type: "email",
      label: "Email Address",
      autoComplete: "off",
      placeholder: "",
      required: true,
    },
    {
      type: "password",
      label: "Password",
      autoComplete: "off",
      placeholder: "",
      required: true,
    },
  ];

  // return authState === AuthState.SignedIn && user ? (
  //   <>
  //     {

  //       authState === 'signedin' && prevAuthState === 'confirmSignUp' ? (
  //         <Redirect to={AppRoutes.POSTREGISTRATION} />
  //       ):(
  //         <Redirect to={AppRoutes.POSTAUTHENTICATION} />
  //       )
  //     }
  //   </>
  // ) : (
  return (
    <>
      <Disclosure as="nav">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 mb-4">
              <div className="relative flex items-center justify-between h-16">
                {/* Mobile menu button*/}
                {/* <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div> */}
                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex-shrink-0 flex items-center">
                    {/* <img
                    className="block lg:hidden h-8 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                    alt="Workflow"
                  />
                  <img
                    className="hidden lg:block h-8 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
                    alt="Workflow"
                  /> */}
                  </div>
                  <div className="hidden sm:block sm:ml-6 text-center">
                    <div className="flex space-x-4 title">
                      <h1>AFFIDAVITS &amp; RFI </h1>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 hidden">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={mergeClassNames(
                        item.current ? " text-link-active" : "",
                        "px-3 py-2 rounded-md text-sm font-medium w-full",
                        item.name === "Signup" ? "signup-btn text-white" : ""
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </Disclosure>
      <div className="grid grid-cols-2 gap-4">
        <div className="welcome-message">
          <h1>
            A Software Built for Managing Affidavits and Exchanging RFIs with
            your Clients
          </h1>
        </div>

        <div className="authcontainer">
          <AmplifyAuthenticator usernameAlias="email">
            <AmplifySignIn
              usernameAlias="email"
              slot="sign-in"
              headerText="Welcome Back!"
              formFields={AuthFields.login}
            />
            <AmplifySignUp
              usernameAlias="email"
              slot="sign-up"
              formFields={signUpFields}
              headerText="Start Your Free Trial Now"
            />

            <AmplifyForgotPassword
              usernameAlias="email"
              slot="forgot-password"
              formFields={AuthFields.forgotpassword}
              headerText="Forgot Password"
            />
          </AmplifyAuthenticator>
        </div>
      </div>
    </>
  );
  //);
};

function mergeClassNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default Authentication;
