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

    setTimeout(() => {
      console.log("email: ", window.gapi.auth2.getAuthInstance().currentUser.get().wt.cu);
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

      const params = {
        query: saveRefreshToken,
        variables: {
          companyId: localStorage.getItem("companyId"),
          userId: localStorage.getItem("userId"),
          email: window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().cu,
          code: response.code,
        },
      };

      API.graphql(params).then((param) => {
        console.log(param);
        this.setState((state) => ({
          isLogined: response,
        }));
        localStorage.setItem("signInData", JSON.stringify(response));
        localStorage.setItem("emailAddressIntegration", window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().cu);
        window.location.reload();
      });

    }, 1000);  
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
      //window.location.reload();
    });
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
