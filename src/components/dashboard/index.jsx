import React, { Component } from "react";
import { Auth } from "aws-amplify";
import Navbar from '../navigation/Navbar.js';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from '../../pages/Home';
import Page1 from '../../pages/Page1';
import Page2 from '../../pages/Page2';

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
                <Route path='/' exact component={Dashboard} />
                <Route path='/page1' component={Page1} />
                <Route path='/page2' component={Page2} />
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


