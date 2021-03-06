import React, {Component} from 'react';
import {render} from 'react-dom';
import {BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom'
import {NotificationContainer, NotificationManager} from 'react-notifications';


import App from './components/App/App';
import NotFound from './components/App/NotFound';
import NavBar from './components/NavBar/NavBar'
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import ImageUpload from './components/ImageUpload/ImageUpload';

import 'react-notifications/lib/notifications.css';
import './styles/styles.scss';

var firebase = require('firebase');

// var fbconfig =

firebase.initializeApp(fbconfig);

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      filterVal: 'select',
      loaded: false
    };
    this.setAuthState = this.setAuthState.bind(this)
    this.logout = this.logout.bind(this)
    this.setFilter = this.setFilter.bind(this);
  }

  logout() {
    this.setState({
      user: null,
      loaded: false
    }, () => {
      this.setState({loaded: true});
    })
  }

  setAuthState(user) {
    this.setState({
      user: user
    }, () => {
      this.setState({loaded: true})
    })
  }

  setFilter(subject) {
    this.setState({
      filterVal: subject,
      loaded: false
    }, () => {
      this.setState({loaded: true});
  	});
  }

  componentWillMount() {

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          user: user
        }, () => {
          this.setState({loaded: true})
        })
      } else {
        this.setState({
          user: null
        }, () => {
          this.setState({loaded: true})
        })
      }
    })
  }

  render() {

    if (this.state.user && this.state.loaded) {
      return (
        <div>
        <NotificationContainer/>

        <Router>
        <div>
          <NavBar auth={this.state.user} logout={this.logout} filterCallBack={this.setFilter}/>
          <App filterVal={this.state.filterVal} user={this.state.user}/>
        </div>
      </Router>
    </div>)
    } else if (!this.state.user && this.state.loaded) {
      return (<div>
        <NotificationContainer/>

        <Router>


        <div>

          <NavBar auth={this.state.user}/>
          <Switch>

            <Route path="/signup" render={() => <SignUp update={this.setAuthState}/>}/>
            <Route path="/login" render={() => <Login update={this.setAuthState}/>}/>
            <Redirect to="/login"/>

          </Switch>
        </div>
      </Router>
    </div>)
    } else {
      return (<div>
        <h1>Please wait</h1>
      </div>)
    }
  }
}
render(<Index/>, document.getElementById('app'));
