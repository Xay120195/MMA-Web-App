import React, { Component } from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import { API } from "aws-amplify";
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
  }

  async login(response) {
    console.log("code: ",response);
    console.log("email: ", window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().cu);
    localStorage.setItem("emailAddressIntegration", window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().cu);

    const saveRefreshToken = `
    mutation connectToGmail($companyId: ID, $email: String, $userId: ID, $code: String) {
      gmailConnectFromCode(
        email: $email
        userId: $userId
        companyId: $companyId
        code: $code
      ) {
        id
        refreshToken
        userId
        companyId
        updatedAt
      }
    }
    `;

    const request = await API.graphql({
      query: saveRefreshToken,
      variables: {
        companyId: localStorage.getItem("companyId"),
        userId: localStorage.getItem("userId"),
        email: window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().cu,
        code: response.code,
      },
    });

    if (request) {
      this.setState((state) => ({
        isLogined: response,
      }));
      localStorage.setItem("signInData", JSON.stringify(response));
      
      window.location.reload();
    }
  }

  logout(response) {
    this.setState((state) => ({
      isLogined: null,
    }));
    localStorage.removeItem("signInData");
    localStorage.removeItem("emailAddressIntegration");
    window.location.reload();
  }

  handleLoginFailure(response) {
    console.log(response);
  }

  handleLogoutFailure(response) {
    console.log(response);
  }

  render() {
    return (
      <div>
        {this.state.isLogined ? (
          <GoogleLogout
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText={"Signout - "+localStorage.getItem("emailAddressIntegration")}
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
            scope="https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly openid"
          />
        )}
      </div>
    );
  }
}

export default GmailIntegration;
