import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
var firebase = require('firebase');
var firebaseui = require('firebaseui');
const ttcLogo = require("../../../public/assets/img/ttcLogo.png")

import '../../styles/bulma.css';

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  handleSignOut() {

    firebase.auth().signOut().then(function() {
      console.log('Signed Out');
      //this.props.logout();
    }, function(error) {
      console.error('Sign Out Error', error);
    });
    this.props.logout()
  }

  render() {
    if (this.props.auth) {
      // User is signed in.
      return (
        <nav className="navbar" aria-label="main navigation">
          <div className="navbar-brand">

		  	<img style={{height: 60}} src={ttcLogo} />

            <button className="button navbar-burger">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
		  <div className="navbar-menu">
		  	<div className="navbar-start">
				<Link className="navbar-item" to="/">
	              Home
	            </Link>
	            <Link className="navbar-item" to="/dashboard">
	              Assignments
	            </Link>
			</div>
			<div className="navbar-end">
				<button style={{margin: 15}} className="button" onClick={this.handleSignOut}>Sign Out</button>
			</div>
		  </div>
        </nav>)
    } else {
      return (<div className="navbar-item">
        <Link className="navbar-item" to="/signup">
          Sign Up
        </Link>
        <Link className="navbar-item" to="/login">
          Log In
        </Link>
      </div>)
    }
    return null;
  }
}

export default NavBar;
