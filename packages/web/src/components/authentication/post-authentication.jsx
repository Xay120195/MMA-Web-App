import React, { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";

export default function PostRegistration() {
  const [error, setError] = useState(null);

  let history = useHistory();

  useEffect(() => {
    clearLocalStorage();

    let getUser = async () => {
      try {
        await Auth.currentAuthenticatedUser({
          bypassCache: true,
        })
          .then((cognitoUser) => {
            localStorage.setItem("userId", cognitoUser.attributes["sub"]);
            localStorage.setItem("email", cognitoUser.attributes["email"]);
            localStorage.setItem("firstName",cognitoUser.attributes["given_name"]);
            localStorage.setItem("lastName",cognitoUser.attributes["family_name"]);
            localStorage.setItem("company",cognitoUser.attributes["custom:company_name"]);
            localStorage.setItem("userType", cognitoUser.attributes[""]);
            history.push(AppRoutes.DASHBOARD);
          })
          .catch((err) => setError(err));
      } catch (e) {
        setError(e.errors[0].message);
      }
    };
    getUser();
  }, []);

  function clearLocalStorage() {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("company");
  }

  return <p>{error ? `Oops! Something went wrong. ${error}` : null}</p>;
}
