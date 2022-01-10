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
        }).then((cognitoUserInfo) => {
          setAccountDetails(cognitoUserInfo);
        });
      } catch (e) {
        setError(e);
      }
    };
    getUser();
  });

  const setAccountDetails = async (cognitoUserInfo) => {
    const getAllPages = `
    query getAllPages {
      page {
        id
        features {
          id
        }
      }
    }
  `;

    const access = await API.graphql({
      query: getAllPages,
    });

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
      userType: "OWNER",
      access: access.data.page,
    };


  

    createAccount(company, access.data.page, user);
  };

  async function createAccount(company, pageAcess, user) {
    console.group("createAccount");
    console.log("Company Details:", company);
    console.log("User Details:", user);

    await createCompany(company).then((c) => {
      user["company"] = c.data.companyCreate;

      let companyAccessType = {
        companyId: c.data.companyCreate.id,
        access: pageAcess
      }
      
      // for restructure
      createCompanyAccessType(companyAccessType, "OWNER");
      // createCompanyAccessType(companyAccessType, "LEGALADMIN");
      // createCompanyAccessType(companyAccessType, "BARRISTER");
      // createCompanyAccessType(companyAccessType, "EXPERT");
      // createCompanyAccessType(companyAccessType, "CLIENT");
      // createCompanyAccessType(companyAccessType, "WITNESS");

    });

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
  }

  function createCompanyAccessType(companyAccessType, userType) {
    return new Promise((resolve, reject) => {
      try {
        // for restructure
        companyAccessType['userType'] = userType;
        
        const request = API.graphql({
          query: mCreateCompanyAccessType,
          variables: companyAccessType,
        });
        console.log(companyAccessType);
        console.log("mCreateCompanyAccessType result");
        console.log(request);
        resolve(request);
      } catch (e) {
        setError(e.errors[0].message);
        reject(e.errors[0].message);
      }
    });
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

  const mCreateCompany = `
  mutation createCompany($name: String, $representative: RepresentativeInput){
    companyCreate(
      name: $name
      representative: $representative
    ) {
      id
      name
    }
  }
`;

  const mCreateCompanyAccessType = `
  mutation createCompanyAccessType($companyId: String, $userType: UserType, $access: [AccessInput]){
    companyAccessTypeCreate(
      companyId: $companyId
      userType: $userType
      access: $access
    ) {
      id
    }
  }
`;

  const mCreateUser = `
  mutation createUser($id: ID!, $email: AWSEmail, $firstName: String, $lastName: String, $userType: UserType, $company: CompanyInput){
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

  return <p>{error ? `Oops! Something went wrong. ${error}` : null}</p>;
}
