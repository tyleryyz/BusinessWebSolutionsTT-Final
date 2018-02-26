import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
import '../../styles/bulma.css';
var firebase = require('firebase');
var provider = new firebase.auth.FacebookAuthProvider();

class LogIn extends Component {
  constructor(props) {
    super(props);
    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleFacebookLogin = this.handleFacebookLogin.bind(this);
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

  handleFacebookLogin(e) {
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      const email = user.email;
      const uID = user.uid;
      const nameArray = user.displayName.split(" ");
      console.log(nameArray)
      const fname = nameArray[0];
      const lname = nameArray[1];
      const permission = "Student"
      const school = null;
      const classList = null;

      console.log(result.additionalUserInfo.isNewUser);
      console.log(fname, lname, uID, email)
      if (result.additionalUserInfo.isNewUser){
        fetch('/api/users', {
          method: 'POST',
          headers: {
            "Content-Type": "Application/json"
          },
          body: JSON.stringify({fname: fname, lname: lname, email: email, uID: uID, school: school, permission: "Student"})
        });
      }
      console.log("uid: ", user.uid)
      this.props.update(user);

    }).catch(function(error) {

      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
      console.log("borked")
      console.log("errorCode: ", errorCode)
      console.log("errorMessage: ", errorMessage)
      console.log("emailError: ", email)
      console.log("credential: ", credential)
    });

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
    return (<div>
      <form onSubmit={this.handleLogIn}>
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
          <p>log in with Facebook</p>
        </div>
      </form>
      <button onClick={this.handleFacebookLogin}>Sign up with Facebook</button>
    </div>);

  }
}

export default LogIn;
