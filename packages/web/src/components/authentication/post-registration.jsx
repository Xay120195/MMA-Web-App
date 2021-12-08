import React, { useState, useEffect } from "react";
import { Auth, API } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";

export default function PostRegistration() {
  const [error, setError] = useState(null);

  let history = useHistory();

  useEffect(() => {
    let getUser = async () => {
      try {
        await Auth.currentAuthenticatedUser({
          bypassCache: true, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        })
          .then((cognitoUserInfo) => {
            setAccountDetails(cognitoUserInfo);
          })
          .catch((err) => setError(err));
      } catch (e) {
        setError(e);
      }
    };
    getUser();
  }, []);

  const setAccountDetails = async (cognitoUserInfo) => {
    const company = {
      name: cognitoUserInfo.attributes["custom:company_name"],
      representative: {
        id: cognitoUserInfo.attributes["sub"],
        firstName: cognitoUserInfo.attributes["given_name"],
        lastName: cognitoUserInfo.attributes["family_name"],
      },
    };

    const user = {
      id: cognitoUserInfo.attributes["sub"],
      firstName: cognitoUserInfo.attributes["given_name"],
      lastName: cognitoUserInfo.attributes["family_name"],
      email: cognitoUserInfo.attributes["email"],
      company: company,
      userType: "owner",
    };

    createAccount(company, user);
  };

  async function createAccount(company, user) {
    console.group("createAccount");

    console.log(company);
    await createCompany(company).then((c) => {
      user["company"] = c.data.companyCreate;
    });

    console.log(user);
    await createUser(user).then((u) => {
      console.log(u);
      history.push(AppRoutes.POSTAUTHENTICATION);
    });
  }

  function createCompany(company) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mCreateCompany,
          variables: company,
        });

        resolve(request);
      } catch (e) {
        setError(e.errors[0].message);
        reject(e.errors[0].message);
      }
    });

    //console.log(res.data.companyCreate);
  }

  async function createUser(user) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mCreateUser,
          variables: user,
        });

        resolve(request);
      } catch (e) {
        setError(e.errors[0].message);
        reject(e.errors[0].message);
      }
    });
  }

  async function getCompany() {
    const res = await API.graphql({
      query: getCompanyById,
      variables: {
        id: "d77851b6-2bd0-4253-a2db-481b79c83ab9",
      },
    });

    console.log(res);
  }

  const getCompanyById = `
  query getCompanyById($id: String) {
    company(id: $id) {
      createdAt
      email
      id
      logo
      name
      phone
      updatedAt
    }
  }
`;

  const mCreateCompany = `
  mutation createCompany($name: String, $representative: representativeInput){
    companyCreate(
      name: $name
      representative: $representative
    ) {
      id
      name
    }
  }
`;

  const mCreateUser = `
  mutation createUser($id: ID!, $email: AWSEmail, $firstName: String, $lastName: String, $userType: UserType, $company: companyInput){
    userCreate(
      id: $id
      email: $email
      firstName: $firstName
      lastName: $lastName
      userType: $userType
      company: $company
    ) {
      id
    }
  }
`;

  return <p>{error ? `Oops... ${error}` : null}</p>;
}
