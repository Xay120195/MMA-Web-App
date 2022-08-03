import React, { Component, useState } from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import { API } from "aws-amplify";
var momentTZ = require("moment-timezone");
class GmailIntegration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogined: localStorage.getItem("signInData")
        ? JSON.parse(localStorage.getItem("signInData"))
        : null,
    };

    this.login = this.login.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.logout = this.logout.bind(this);
    this.handleLogoutFailure = this.handleLogoutFailure.bind(this);

    this.setState((state) => ({
      refreshToken: props.refreshToken,
    }));
  }

  async login(response) {
    try {
      const saveRefreshToken = `
      mutation connectToGmail($companyId: ID, $email: String, $userId: ID, $code: String, $userTimeZone: String) {
        gmailConnectFromCode(
          email: $email
          userId: $userId
          companyId: $companyId
          code: $code
          userTimeZone: $userTimeZone
        ) {
          id
          refreshToken
          userId
          companyId
          updatedAt
        }
      }
      `;

      setTimeout(() => {
        const isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();
        if (isSignedIn) {
          const authCurrentUser = window.gapi.auth2
            .getAuthInstance()
            .currentUser.get().wt.cu;

          console.log("authCurrentUser: ", authCurrentUser);

          const params = {
            query: saveRefreshToken,
            variables: {
              companyId: localStorage.getItem("companyId"),
              userId: localStorage.getItem("userId"),
              email: authCurrentUser,
              code: response.code,
              userTimeZone: momentTZ.tz.guess(),
            },
          };

          console.log("Params", params);

          API.graphql(params).then((r) => {
            console.log("Response: ", r);

            if (r.data.gmailConnectFromCode !== null) {
              this.setState((state) => ({
                isLogined: response,
              }));
              localStorage.setItem("signInData", JSON.stringify(response));
              localStorage.setItem("emailAddressIntegration", authCurrentUser);
              window.location.reload();
            } else {
              console.log("MMA Error: Unable to sign in.");
            }
          });
        } else {
          console.log("API Error: Unable to sign in.");
        }
      }, 1000);
    } catch (e) {
      console.log("saveRefreshToken Error:", e);
    }
  }

  logout(response) {
    this.setState((state) => ({
      isLogined: null,
    }));

    const removeRefreshToken = `
    mutation removeRefreshToken($email: String) {
      gmailDisconnect(email: $email) {
        id
      }
    }
    `;
    const params = {
      query: removeRefreshToken,
      variables: {
        email: localStorage.getItem("emailAddressIntegration"),
      },
    };

    API.graphql(params).then((param) => {
      console.log(param);
      localStorage.removeItem("signInData");
      localStorage.removeItem("emailAddressIntegration");
      window.location.reload();
    });
  }

  handleLoginFailure(response) {
    console.log(response);
  }

  handleLogoutFailure(response) {
    console.log(response);
  }

  render() {
    console.log("this.state.refreshToken", this.state.refreshToken);
    return (
      <div>
        {this.state.isLogined && this.state.refreshToken ? (
          <GoogleLogout
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText={
              "Signout - " + localStorage.getItem("emailAddressIntegration")
            }
            onLogoutSuccess={this.logout}
            onFailure={this.handleLogoutFailure}
          ></GoogleLogout>
        ) : (
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Login with Google"
            onSuccess={this.login}
            onFailure={this.handleLoginFailure}
            cookiePolicy={"single_host_origin"}
            responseType="code"
            approvalPrompt="force"
            prompt="consent"
            access_type="offline"
            scope="https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly openid https://www.googleapis.com/auth/gmail.metadata"
          />
        )}
      </div>
    );
  }
}

export default GmailIntegration;
