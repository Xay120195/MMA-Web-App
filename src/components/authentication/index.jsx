import React from 'react';
import { Redirect } from "react-router-dom";
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import '../../assets/styles/Auth.css'

import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
//import { BellIcon, MenuIcon, XIcon, LogoutIcon } from '@heroicons/react/outline'

const navigation = [
  { name: 'Contact', href: '/contact', current: false },
  { name: 'Login', href: '/login', current: true },
  { name: 'Signup', href: '/signup', current: false }
]

function mergeClassNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


const signUpFields = [
  {
    type: "text",
    label: "First Name",
    placeholder: "",
    required: true,
  },
  {
    type: "text",
    label: "Last Name",
    placeholder: "",
    required: true,
  },
  {
    type: "text",
    label: "Company Name",
    placeholder: "",
    required: true,
  },
  {
    type: "email",
    label: "Email Address",
    placeholder: "",
    required: true,
  },
  {
    type: "password",
    label: "Password",
    placeholder: "",
    required: true,
  },
];

const signInFields = [
  {
    type: "email",
    label: "Email Address",
    placeholder: "",
    required: true,
  },
  {
    type: "password",
    label: "Password",
    placeholder: "",
    required: true,
  },
];

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
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                
              {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={mergeClassNames(
                          item.current ? ' text-link-active' : '',
                          'px-3 py-2 rounded-md text-sm font-medium w-full',
                          item.name === 'Signup' ? 'signup-btn text-white':''
                        )}
                        aria-current={item.current ? 'page' : undefined}
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
        <h1>A Software Built for Managing Affidavits and Exchanging RFIs with your Clients</h1>
      </div>

      <div className="authcontainer">
      <AmplifyAuthenticator hideDefault={true} >
        <AmplifySignIn 
          slot="sign-in" 
          usernameAlias="email"  
          headerText="Welcome Back!"
          hideSignUp
          formFields={signInFields}
        />
        <AmplifySignUp
          slot="sign-up"
          formFields={signUpFields}
          headerText="Start Your Free Trial Now"
        />
      </AmplifyAuthenticator>
      </div>
      </div>
    </>
  );
}


export default Authentication;