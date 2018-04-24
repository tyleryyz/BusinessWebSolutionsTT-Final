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
	   this.state = {
		filterVal: 'select',
    loaded: true
	}
    this.children = this.props.children;
   this.setFilter = this.setFilter.bind(this);
  }

  setFilter(subject) {
    this.setState({
      filterVal: subject,
      loaded: false
    }, () => {
      this.setState({loaded: true});
  	});
  }

  render() {
    if (this.state.loaded){
      return (<div>
        <Switch>
          <Route path="/tt-admin" render={() => <Admin user={this.props.user}/>}/>
          <Route exact path="/" render={() => <Home user={this.props.user} filterCallBack={this.setFilter} />}/>
          <Route path="/Claims" render={() => <Claims user={this.props.user}/>}/>
          <Route path="/Dashboard" render={() => <Dashboard user={this.props.user} filterVal={this.state.filterVal}/>}/>
          <Route path="/Submissions" render={() => <Submissions user={this.props.user}/>}/>
          <Route path="/Emailing" render={() => <Emailing user={this.props.user}/>}/>
          <Route path="/imageupload" render={() => <ImageUpload user={this.props.user}/>}/>
          <Route path="/paypal" render={() => <PayPal user={this.props.user}/>}/>
          <Route path="/VideoPlayer" render={() => <VideoPlayer/>}/>
          <Route path="/EditProfile" render={()=> <EditProfile user={this.props.user}/>}/>
          <Redirect to="/"/>
        </Switch>
        </div>)
      } else {
        return (<p>Please wait</p>)
      }
    }
}
export default App;
