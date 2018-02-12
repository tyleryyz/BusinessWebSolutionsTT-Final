import React, {Component} from 'react';
import {render} from 'react-dom';
import {BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom'

import App from './components/App/App';
import NotFound from './components/App/NotFound';
import NavBar from './components/NavBar/NavBar'

import Home from './components/Home/Home';

import HelloWorld from './components/HelloWorld/HelloWorld';

import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import ImageUpload from './components/ImageUpload/ImageUpload';

import './styles/styles.scss';

var firebase = require('firebase');

var fbconfig = {
  apiKey: "AIzaSyDVVLR1UvlHbQtnSwPWqdbt_t3zZBwG3I8",
  authDomain: "businesswebsolutionstt-final.firebaseapp.com",
  databaseURL: "https://businesswebsolutionstt-final.firebaseio.com",
  projectId: "businesswebsolutionstt-final",
  storageBucket: "",
  messagingSenderId: "103955267073"
};

firebase.initializeApp(fbconfig);

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false
    };
    this.setAuthState = this.setAuthState.bind(this)
    this.logout = this.logout.bind(this)
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
  // componentDidMount() {
  // 	let currentUser;
  //
  // 	currentUser = localStorage.getItem('user')
  //
  // 	if (currentUser) {
  //     this.setState({
  //       user: currentUser
  //     }, () => {
  //       this.setState({loaded: true})
  //     })
  //   } else {
  //     this.setState({
  //       user: null
  //     }, () => {
  //       this.setState({loaded: true})
  //     })
  //   }
  // }

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
  // if (user) {
  // 	this.setState({
  // 		user: user
  // 	}, () => {
  // 		this.setState({loaded: true})
  // 	})
  // } else {
  //   this.setState({
  //     user: null
  //   }, () => {
  //     this.setState({loaded: true})
  //   })
  // }

  render() {

    if (this.state.user && this.state.loaded) {
      return (<Router>
        <div>

          <NavBar auth={this.state.user} logout={this.logout}/>
          <App user={this.state.user}/>
        </div>
      </Router>)
    } else if (!this.state.user && this.state.loaded) {
      return (<Router>
        <div>

          <NavBar auth={this.state.user}/>
          <Switch>

            <Route path="/signup" render={() => <SignUp update={this.setAuthState}/>}/>
            <Route path="/login" render={() => <Login update={this.setAuthState}/>}/>
            <Redirect to="/login"/>

          </Switch>
        </div>
      </Router>)
    } else {
      return (<div>
        <h1>Please wait</h1>
      </div>)
    }
  }
}
render(<Index/>, document.getElementById('app'));
