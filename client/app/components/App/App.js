import React, {Component} from 'react';
import {render} from 'react-dom';
import {BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom'

import NotFound from './NotFound';

import Home from '../Home/Home';

import Dashboard from '../Dashboard/Dashboard';
import HelloWorld from '../HelloWorld/HelloWorld';

import Login from '../Login/Login';
import Signup from '../SignUp/SignUp';
import ImageUpload from '../ImageUpload/ImageUpload';
import Admin from '../Admin/Admin';

import '../../styles/styles.scss';
var firebase = require('firebase');

class App extends Component {
  constructor(props) {

    super(props);
    console.log(this.props);
    this.children = this.props.children;
  }

  render() {

    return (<div>
      <Switch>
        <Route path="/tt-admin" render={() => <Admin user={this.props.user}/>}/>
        <Route exact path="/" render={() => <Home user={this.props.user}/>}/>
        <Route path="/dashboard" render={() => <Dashboard/>}/>
        <Route path="/helloworld" render={() => <HelloWorld/>}/>
        <Route path="/imageupload" render={() => <ImageUpload/>}/>
        <Redirect to="/"/>
      </Switch>
    </div>)
  }
}
export default App;
