import React, { Component } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
class GoogleBtn extends Component {
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
    if(response.accessToken){
      this.setState(state => ({
        isLogined: response,
      }));

      console.log(response);
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
            buttonText={"Logout - "+this.state.isLogined.profileObj.givenName+" ("+this.state.isLogined.profileObj.email+")"}
            onLogoutSuccess={ this.logout }
            onFailure={ this.handleLogoutFailure }
        >
        </GoogleLogout>: <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText='Google Sign In'
            onSuccess={ this.login }
            onFailure={ this.handleLoginFailure }
            cookiePolicy={ 'single_host_origin' }
            responseType='code,token'
        />
      }
    </div>
    )
  }
}

export default GoogleBtn;