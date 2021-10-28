import React, { Component } from "react";
import { Auth } from "aws-amplify";
import Navbar from '../navigation/Navbar.js';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { AppRoutes } from "../../constants/AppRoutes";

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
            <Router>
                <Navbar />
                <Switch>
                <Route path='/' />
                <Route path={AppRoutes.DASHBOARD} />
                <Route path={AppRoutes.MATTERSPAGE} />
                </Switch>
            </Router>
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


