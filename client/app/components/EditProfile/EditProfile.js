import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
var firebase = require('firebase');
var firebaseui = require('firebaseui');

import '../../styles/bulma.css';

class EditProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false
    };
    this.getData = this.getData.bind(this);
    this.handleEditProfile = this.handleEditProfile.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  getData() {
    let uID = this.props.user.uid;
    console.log(uID)
    return (fetch(`/api/users?uID=${uID}`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  componentWillMount() {
    let result = this.getData().then((user) => {
      console.log("will mount here", user)
      this.setState({
        user: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  };

  handleEditProfile(e) {
    e.preventDefault();
    const fname = e.target.elements.fname.value;
    const lname = e.target.elements.lname.value;
    const email = this.state.user.email;
    fetch(`/api/users?email=${email}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({fname: fname, lname: lname})
    });
  }

  handleEmailChange(e){
    e.preventDefault();
    const currentUser = this.props.user
    const newEmail = e.target.elements.email.value;
    const currentEmail = this.state.user.email;
    currentUser.updateEmail(newEmail).then(function() {
      fetch(`/api/users?email=${currentEmail}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({email: newEmail})
      });
      // Update successful.
    }).catch(function(error) {
      console.log(error);
      // An error happened.
    });

  }

  handlePasswordChange(e){
    e.preventDefault();
    var user = this.props.user;
    var newPassword = e.target.elements.password.value;

    user.updatePassword(newPassword).then(function() {
      console.log("Success!")
      // Update successful
    }).catch(function(error) {
      console.log("failure")
    });
  }

  render() {
    if (this.state.user && this.state.loaded){
    return (<div className="container">
    <div className="box">

      <form onSubmit={this.handleEditProfile}>
          <div className="field">
            <label className="label">First Name: {this.state.user.fname}</label>
            <div className="control">
              <input className="input" name="fname" type="text" placeholder="First Name"/>
            </div>
          </div>
          <div className="field">
            <label className="label">Last Name: {this.state.user.lname}</label>
            <div className="control">
              <input className="input" name="lname" type="text" placeholder="Last Name"/>
            </div>
          </div>
          <div className="control">
            <button className="button">Save Changes</button>
          </div>
      </form>
      </div>

      <div className="box">
      <form onSubmit={this.handleEmailChange}>
        <div className="field">
          <label className="label">Email: {this.state.user.email} (Warning: Changing this will affect your login!)</label>
          <div className="control">
            <input className="input" name="email" type="email" placeholder="Email"/>
          </div>
        </div>
        <div className="control">
          <button className="button">Change Email</button>
        </div>
      </form>
      </div>
      <div className="box">
      <form onSubmit={this.handlePasswordChange}>
        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input className="input" name="password" type="text" placeholder="Password"/>
          </div>
        </div>
        <div className="control">
          <button className="button">Change Password</button>
        </div>
      </form>
      </div>
        <div id="cancelButton">
          <div className="control">
            <Link to="/">Cancel</Link>
          </div>
        </div>
    </div>);
  } else return(<p>Please wait</p>)
}
}

export default EditProfile;
