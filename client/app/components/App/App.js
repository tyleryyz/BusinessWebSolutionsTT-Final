import React, {Component} from 'react';
import {render} from 'react-dom';
import {BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom'

import NotFound from './NotFound';

import Home from '../Home/Home';

import Dashboard from '../Dashboard/Dashboard';
import Emailing from '../Emailing/Emailing';
import PayPal from '../PayPal/PayPal';

import Login from '../Login/Login';
import Signup from '../SignUp/SignUp';
import ImageUpload from '../ImageUpload/ImageUpload';
import VideoPlayer from '../VideoPlayer/VideoPlayer';

import Admin from '../Admin/Admin';
import EditProfile from '../EditProfile/EditProfile';
import Claims from '../Claims/Claims';
import Submissions from '../Submissions/Submissions';

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
        <Route path="/Claims" render={() => <Claims user={this.props.user}/>}/>
        <Route path="/Dashboard/:subject" render={() => <Dashboard user={this.props.user} />}/>
		    <Route path="/Submissions" render={() => <Submissions user={this.props.user}/>}/>
        <Route path="/Emailing" render={() => <Emailing user={this.props.user}/>}/>
        <Route path="/imageupload" render={() => <ImageUpload user={this.props.user}/>}/>
        <Route path="/paypal" render={() => <PayPal user={this.props.user}/>}/>
        <Route path="/VideoPlayer" render={() => <VideoPlayer/>}/>
        <Route path="/EditProfile" render={()=> <EditProfile user={this.props.user}/>}/>
        <Redirect to="/"/>
      </Switch>
    </div>)
  }
}
export default App;
