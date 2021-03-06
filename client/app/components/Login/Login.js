import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
import '../../styles/bulma.css';

const fbBtn = require("../../../public/assets/img/facebook2.png")

var firebase = require('firebase');
var provider = new firebase.auth.FacebookAuthProvider();

class LogIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fbError: null,
      emailError: false,
      passwordError: false,
      facebookError: null,
      selectedSchool: 'select',
      newUser: false,
      selectedCourses: null,
      loaded: true,
      schools: []
    }
    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleFacebookLogin = this.handleFacebookLogin.bind(this);
  }


  handleLogIn(e) {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    let errorCode;
    let errorMessage;
    if (!email) {
      this.setState({
        emailError: true,
        loaded: false
      }, () => {
        loaded : true
      });
    }
    if (!password) {
      this.setState({
        passwordError: true,
        loaded: false
      }, () => {
        loaded : true
      });
    }

    firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
      // Handle Errors here.
      errorCode = error.code;
      errorMessage = error.message;
      this.setState({
        fbError: errorMessage,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    });
    let user = firebase.auth().currentUser
    //this.props.update(user);

  }

  handleFacebookLogin(e) {
    firebase.auth().signInWithPopup(provider).then(function(result) {
      let errorCode;
      let errorMessage;
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;

    }).catch((error) => {

      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;

      this.setState({
        facebookError: errorMessage,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });

    });

  }
  render() {
    let $courseData;
    if (this.state.loaded) {
        return (<div className="container">
          <div style={{
              textAlign: "center"
            }} className="block">

            <h1 className="title">Tailored Tutoring Co.</h1>
            <h2 className="subtitle">
              <i>"Your homework - explained."</i>
            </h2>
          </div>
          <div className="columns">
            <div className="column"><span/></div>
            <div className="column has-text-centered">

              <br/>
              <br/>
              <div className="container">

              <form onSubmit={this.handleLogIn}>
                  {
                    this.state.fbError
                      ? <p style={{
                            color: 'red'
                          }}>{this.state.fbError}</p>
                      : <p></p>
                  }
                  <div className="box">
                    <div className="field">
                      {
                        this.state.emailError
                          ? <p style={{
                                color: 'red'
                              }}>Please enter an email</p>
                          : <p></p>
                      }
                      <p className="control">
                        <input className="input" name="email" type="email" placeholder="Email"/>
                      </p>
                    </div>
                    <div className="field">
                      {
                        this.state.passwordError
                          ? <p style={{
                                color: 'red'
                              }}>Please enter a password</p>
                          : <p></p>
                      }
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

                  <br/>

              </form>
              <p>or sign in with Facebook</p>

              <img src={fbBtn} onClick={this.handleFacebookLogin} width={250}/> {
                this.state.facebookError
                  ? <p style={{
                        color: 'red'
                      }}>{this.state.facebookError}</p>
                  : <p></p>
              }
              <br/> {
                <Link to="/SignUp">
                  Don't have a profile? Sign Up!
                </Link>
              }
              </div>
            </div>
            <div className="column is-2"><span/></div>
          </div>

        </div>);
      } else {
        return (<p>Please Wait</p>)
      }
    } 
}

export default LogIn;
