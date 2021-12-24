import React, { useState, useEffect } from "react";
import { Auth, API } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";

export default function PostRegistration() {
  const [error, setError] = useState(null);

  let history = useHistory();

  useEffect(() => {
    clearLocalStorage();

    const userDetails = `
      query user($id: String) {
        user(id: $id) {
          company {
            name
          }
          email
          firstName
          lastName
          userType
        }
      }
    `;

    let getUser = async () => {
      try {
        await Auth.currentAuthenticatedUser({
          bypassCache: true,
        }).then((cognitoUser) => {
          var userId = cognitoUser.attributes["sub"];

          API.graphql({
            query: userDetails,
            variables: {
              id: userId,
            },
          }).then((userInfo) => {
            localStorage.setItem("userId", userId);
            localStorage.setItem("email", userInfo.data.user["email"]);
            localStorage.setItem("firstName", userInfo.data.user["firstName"]);
            localStorage.setItem("lastName", userInfo.data.user["lastName"]);
            localStorage.setItem("company", userInfo.data.user["company"]["name"]);
            localStorage.setItem("userType", userInfo.data.user["userType"]);
            history.push(AppRoutes.DASHBOARD);
          });
        });
        //.catch((err) => setError(err));
      } catch (e) {
        console.log(e);
        //setError(e.errors[0].message);
      }
    };

    getUser();
  });

  function clearLocalStorage() {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("company");
  }

  return <p>{error ? `Oops! Something went wrong. ${error}` : null}</p>;
}
