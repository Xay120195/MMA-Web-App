import React, { useState, useEffect } from "react";
import { Auth, API } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";

export default function PostRegistration() {
  const [error, setError] = useState(null);

  let history = useHistory();

  useEffect(() => {
    const userDetails = `
      query user($id: String) {
        user(id: $id) {
          company {
            id
            name
          }
          email
          firstName
          lastName
          userType
        }
      }
    `;

    const getAccountAccess = `
      query getPagesAndAccess($companyId: String, $userType: UserType) {
        companyAccessType(companyId: $companyId, userType: $userType) {
          access {
            id
            name
            features {
              id
              name
            }
          }
        }
      }
      `;

    let getUser = async () => {
      try {
        await Auth.currentAuthenticatedUser({
          bypassCache: true,
        }).then((cognitoUser) => {
          var userId = cognitoUser.attributes["sub"];
          var params = {
            query: userDetails,
            variables: {
              id: userId,
            },
          };
          API.graphql(params).then((userInfo) => {
            

            if(userInfo.data.user["company"]){
              localStorage.setItem("userId", userId);
              localStorage.setItem("email", userInfo.data.user["email"]);
              localStorage.setItem("firstName", userInfo.data.user["firstName"]);
              localStorage.setItem("lastName", userInfo.data.user["lastName"]);
              localStorage.setItem("companyId", userInfo.data.user["company"]["id"]);
              localStorage.setItem("company", userInfo.data.user["company"]["name"]);
              localStorage.setItem("userType", userInfo.data.user["userType"]);
              var params = {
                query: getAccountAccess,
                variables: {
                  companyId: userInfo.data.user["company"]["id"],
                  userType: userInfo.data.user["userType"],
                },
              };

              API.graphql(params).then((ua) => {
                const userAccess = ua.data.companyAccessType[0].access;
                localStorage.setItem("access", JSON.stringify(userAccess));
                history.push(AppRoutes.DASHBOARD);
              });
            } else {
              history.push("/signout");
            }
            
          });
        });
      } catch (e) {
        console.log(e);
        setError(e.errors[0].message);
      }
    };

    getUser();
  });

  return <p>{error ? `Oops! Something went wrong. ${error}` : null}</p>;
}
