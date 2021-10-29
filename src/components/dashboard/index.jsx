import React, { Component } from "react";
import { Auth } from "aws-amplify";
import Navbar from '../navigation';

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
            <Navbar />
            <h1>Welcome to Dashboard!</h1>
            <button className="bg-transparent hover:bg-black-500 text-black-700 font-semibold py-2 px-4 border border-black-500" onClick={this.clickLogout} >LOG OUT</button>
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


