import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Redirect} from 'react-router';
import '../../styles/bulma.css';
var firebase = require('firebase');
var firebaseui = require('firebaseui');

class LogIn extends Component {
  constructor(props) {
    super(props);
    this.handleLogIn = this.handleLogIn.bind(this)
		console.log("props user", this.props.state.user)
  }


  handleLogIn(e) {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      console.log("it broked");
      var errorCode = error.code;
      var errorMessage = error.message;
			console.log(errorCode)
			console.log(errorMessage)
    });
    let user = firebase.auth().currentUser
    this.props.update(user);

	}
    //this.props.update(e, true, "tyler");

    // 	let apiResponse;
    //   const email = e.target.elements.email.value;
    // 	const password = e.target.elements.password.value;
    // 	fetch(`/api/users?email=${email}&password=${password}`, {
    // 												headers: {"Content-Type": "Application/json"},
    // 												method: 'GET'
    // 											})
    // 											.then(res => res.json())
    // 							       	.then(json => {
    // 												localStorage.setItem('user', JSON.stringify(json));
    // 							         this.setState({
    // 							           user: json
    // 							         });
    // 											 this.props.history.push('/');
    // 							       });
    //


  render() {
      return (<form onSubmit={this.handleLogIn}>
        <div className="container">
          <div className="box">
            <div className="field">
              <p className="control">
                <input className="input" name="email" type="email" placeholder="Email"/>
              </p>
            </div>
            <div className="field">
              <p className="control">
                <input className="input" name="password" type="password" placeholder="Password"/>
              </p>
            </div>
            <div className="field">
              <p className="control">
                <button className="button is-success">
                  Login
                </button>
              </p>
            </div>
          </div>
          {
            <Link to="/SignUp">
                Sign Up!
              </Link>
          }
          <p>{this.props.user}</p>
        </div>
      </form>);

  }
}

export default LogIn;
