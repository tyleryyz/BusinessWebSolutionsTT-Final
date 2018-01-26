import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';


import '../../styles/bulma.css';

class NavBar extends Component {

	handleLogOut(){
		localStorage.removeItem('user');
		location.reload()
	}

	tutorsImba(){

    fetch(`/api/users`, { method: 'DELETE' })
	}
  render() {
		let $opButton;
		let $logoutButton;
		let userObject = JSON.parse(localStorage.getItem('user'))
		console.log(userObject);
		if (userObject){
			if(userObject.permission==="tutor"){
				console.log(userObject.fname)
				$opButton = (<button onClick={this.tutorsImba}>Delete all users >:D</button>)
				}
			$logoutButton = (<button onClick={this.handleLogOut}>Log Out</button>)

		}
    return (
			<nav className="navbar" aria-label="main navigation">
  			<div className="navbar-brand">
					<Link className="navbar-item" to="/">
      			Tech Demo Home
					</Link>
					<Link className="navbar-item" to="/helloworld">
      			Email Example
					</Link>
					<Link className="navbar-item" to="/imageupload">
      			Image Upload
					</Link>
					<Link className="navbar-item" to="/signup">
      			Sign Up
					</Link>

					<Link className="navbar-item" to="/login">
      			Log In
					</Link>
					{$logoutButton}
					{$opButton}
			    <button className="button navbar-burger">
			      <span></span>
			      <span></span>
			      <span></span>
			    </button>
  			</div>
			</nav>
    );
  }
}

export default NavBar;
