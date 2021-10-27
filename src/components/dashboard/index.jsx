import React, { Component } from "react";
import { Auth } from "aws-amplify";

export default class Dashboard extends Component {

    constructor(props){
        super(props)
        this.state = {
            pin: '',
            location: ''
        };

        this.clickLogout = this.clickLogout.bind(this);

    }
       
    render(){
        return (
            <>
            <h1>Dashboard Page!</h1>
            <button onClick={this.clickLogout}>LOG OUT</button>
            </>
        )
    }

    async clickLogout() {
        try {
            await Auth.signOut();
            console.log('Sign out');
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }
}


