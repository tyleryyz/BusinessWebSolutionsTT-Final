import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
var firebase = require('firebase');
var firebaseui = require('firebaseui');

import '../../styles/bulma.css';

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  handleSignOut() {

    firebase.auth().signOut().then(function() {
    }, function(error) {
      console.error('Sign Out Error', error);
    });
    this.props.logout()
  }

  render() {
    if (this.props.auth) {
      // User is signed in.
      return (<div className="navbar-item">

        <nav className="navbar" aria-label="main navigation">
          <div className="navbar-brand">
            <Link className="navbar-item" to="/">
              Tech Demo Home
            </Link>
            <Link className="navbar-item" to="/dashboard">
              Dashboard
            </Link>
            <Link className="navbar-item" to="/emailing">
              Email Example
            </Link>
            <Link className="navbar-item" to="/imageupload">
              Image Upload
            </Link>
	           <Link className="navbar-item" to="/paypal">
              Paypal Example
            </Link>
            <a className="navbar-item button" onClick={this.handleSignOut}>Sign Out</a>
            <button className="button navbar-burger">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>
      </div>)
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
