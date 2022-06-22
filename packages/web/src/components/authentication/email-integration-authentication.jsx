import React, { Component } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
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

  login (response) {
    if(response){
      this.setState(state => ({
        isLogined: response,
      }));
      localStorage.setItem('signInData', JSON.stringify(response));
      window.location.reload();
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
        />
      }
    </div>
    )
  }
}

export default GmailIntegration;