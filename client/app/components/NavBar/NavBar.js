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
	this.handleBurger = this.handleBurger.bind(this)
	this.state = {
		burgerClicked: false
	}
  }

  handleSignOut() {

    firebase.auth().signOut().then(function() {
    }, function(error) {
      console.error('Sign Out Error', error);
    });
    this.props.logout()
  }

  handleBurger(e){
	  e.preventDefault();
	  this.setState({
		  burgerClicked: !this.state.burgerClicked,
		  loaded: false
	  }, () => {
		  this.setState({loaded: true})
	  });
  }

  render() {
    if (this.props.auth) {
      // User is signed in.

	  if(this.state.burgerClicked)
	  {
		  return (
			  <section>
		        <nav className="navbar" role="navigation" aria-label="main navigation">
		          <div className="navbar-brand">

				  	<img style={{height: 60}} src={ttcLogo} />

		            <a className="navbar-burger burger is-active" id="burger" ref="burger" data-target="navbartabs" onClick={(e) => this.handleBurger(e)}>
		              <span></span>
		              <span></span>
		              <span></span>
		            </a>
		          </div>
				  <div className="navbar-start">

					<div className="navbar-menu is-hidden-desktop is-active" id="navbartabs">
						<Link className="navbar-item" to="/">
			              Home
			            </Link>
			            <Link className="navbar-item" to="/dashboard">
			              Assignments
			            </Link>
						<button style={{margin: 15}} className="navbar-item button" onClick={this.handleSignOut}>Sign Out</button>
					</div>

					<div className="navbar-tabs is-hidden-touch">
						<Link className="navbar-item" to="/">
			              Home
			            </Link>
			            <Link className="navbar-item" to="/dashboard">
			              Assignments
			            </Link>
					</div>

				  </div>

				  <div className="navbar-end is-hidden-touch">
					<button style={{margin: 15}} className="button" onClick={this.handleSignOut}>Sign Out</button>
				  </div>
		        </nav>
			</section>
			)
	    }
		else if(!this.state.burgerClicked)
		{

			return (
				<section>
				<nav className="navbar" role="navigation" aria-label="main navigation">
				<div className="navbar-brand">

				<img style={{height: 60}} src={ttcLogo} />

				<a className="navbar-burger burger" id="burger" ref="burger" data-target="navbartabs" onClick={(e) => this.handleBurger(e)}>
				<span></span>
				<span></span>
				<span></span>
				</a>
				</div>
				<div className="navbar-start">

				<div className="navbar-menu is-hidden-desktop" id="navbartabs">
				<Link className="navbar-item" to="/">
				Home
				</Link>
				<Link className="navbar-item" to="/dashboard">
				Assignments
				</Link>
				<button style={{margin: 15}} className="navbar-item button" onClick={this.handleSignOut}>Sign Out</button>
				</div>
				<div className="navbar-tabs is-hidden-touch">
				<Link className="navbar-item" to="/">
				Home
				</Link>
				<Link className="navbar-item" to="/dashboard">
				Assignments
				</Link>
				</div>

				</div>

				<div className="navbar-end is-hidden-touch">
				<button style={{margin: 15}} className="button" onClick={this.handleSignOut}>Sign Out</button>
				</div>
			</nav>
		</section>
	)
	}
	  }

    else {
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
	        <Link className="navbar-item" to="/signup">
	          Sign Up
	        </Link>
	        <Link className="navbar-item" to="/login">
	          Log In
	        </Link>
      </div>
  		</nav>)
    }
    return null;
  }
}

export default NavBar;
