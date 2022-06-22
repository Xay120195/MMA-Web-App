import React, { Component } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { API } from "aws-amplify";
class GmailIntegration extends Component {
   constructor(props) {
    super(props);
    this.state = {
      isLogined: localStorage.getItem('signInData')
      ? JSON.parse(localStorage.getItem('signInData'))
      : null,
    };

    this.login = this.login.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.logout = this.logout.bind(this);
    this.handleLogoutFailure = this.handleLogoutFailure.bind(this);
  }

  async login (response) {

    console.log(response);

    const saveRefreshToken = `
      mutation refreshTokenSave($companyId: ID, $email: String, $refreshToken: String, $userId: ID) {
        gmailAddToken(
          email: $email
          refreshToken: $refreshToken
          userId: $userId
          companyId: $companyId
        ) {
          email
          refresh_token
          userId
          companyId
          updatedAt
        }
      }`;

      const request = await API.graphql({
        query: saveRefreshToken,
        variables: {
          companyId: localStorage.getItem("companyId"),
          userId: localStorage.getItem("userId"),
          email: "mmatest.integ@gmail.com",
          refreshToken: "1//062boP79zUwNuCgYIARAAGAYSNwF-L9IrpFlBdqgLGiKr2KV4clRTiuRt2TF7PAu0jjEH1PlV5UD_Z3eEs0Gir7P_qWYMrn93kE8",
        },
      });

      console.log(request);
    if(request){
      this.setState(state => ({
        isLogined: response,
      }));
      localStorage.setItem('signInData', JSON.stringify(response));
      //window.location.reload();
    }
  }

  logout (response) {
    this.setState(state => ({
      isLogined: null,
    }));
    localStorage.removeItem('signInData');
    window.location.reload();
  }

  handleLoginFailure (response) {
    alert('Failed to log in');
  }

  handleLogoutFailure (response) {
    alert('Failed to log out');
  }

  render() {
    
    return (
    <div>
      { this.state.isLogined ?
        <GoogleLogout
            clientId={ process.env.REACT_APP_GOOGLE_CLIENT_ID }
            buttonText={"Signout"}
            onLogoutSuccess={ this.logout }
            onFailure={ this.handleLogoutFailure }
        >
        </GoogleLogout>: <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Login with Google"
            onSuccess={ this.login }
            onFailure={ this.handleLoginFailure }
            cookiePolicy={ 'single_host_origin' }
            responseType="code"
            approvalPrompt="force"
            prompt="consent"
            access_type="offline"
        />
      }
    </div>
    )
  }
}

export default GmailIntegration;