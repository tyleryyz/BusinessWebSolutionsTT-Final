import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
var firebase = require('firebase');
var firebaseui = require('firebaseui');

import '../../styles/bulma.css';

class SignUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      schools: null,
      selectedSchool: 'select',
      selectedCourses: [],
      loaded: false,
      fname: null,
      lname: null,
      email: null,
      password: null,
      nextPage: false
    }
    this.getSchools = this.getSchools.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.schoolSelect = this.schoolSelect.bind(this);
    this.coursesSelect = this.coursesSelect.bind(this);
    this.coursesDeselect = this.coursesDeselect.bind(this);
    this.handleFormData = this.handleFormData.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  componentWillMount() {
    this.getSchools().then((schools) => {
      console.log("schools", schools)
      this.setState({
        schools: schools,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    });
  }

  schoolSelect(e) {
    let value = e.target.value;
    var school = JSON.parse(value);

    this.setState({
      selectedSchool: school,
      courses: school.courses,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  getSchools() {
    return (fetch(`/api/schools`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  coursesSelect(e) {
    e.preventDefault();
    let courses = e.target;
    let value = this.state.selectedCourses;
    for (let i = 0; i < courses.length; i++) {
      if (courses[i].selected && !(this.state.selectedCourses.includes(courses[i].value))) {
        value.push(courses[i].value);
      }
    }
    console.log(value);
    this.setState({
      selectedCourses: value,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  handleBack(e){
    e.preventDefault();
    this.setState({
      nextPage: false,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  coursesDeselect(e) {
    e.preventDefault();
    console.log("here!!!")
    let courses = e.target;
    let value = this.state.selectedCourses;
    for (let i = 0; i < courses.length; i++) {
      if (courses[i].selected) {
        if (value.length === 1) {
          value = [];
        } else {
          value.splice(i, 1);
        }

      }
    }

    this.setState({
      selectedCourses: value,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  handleFormData(e){
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    const fname = e.target.elements.fname.value;
    const lname = e.target.elements.lname.value;

    this.setState({
      fname: fname,
      lname: lname,
      email: email,
      password: password,
      nextPage: true,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  handleSignUp(e) {
    e.preventDefault();
    const email = this.state.email;
    const password = this.state.password;
    const fname = this.state.fname;
    const lname = this.state.lname;
    const school = this.state.selectedSchool;
    const courses = this.state.selectedCourses;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
      var newUser = firebase.auth().currentUser;
      const uID = newUser.uid;
      console.log("inside signup", uID);
      fetch('/api/users', {
        method: 'POST',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({
          fname: fname,
          lname: lname,
          email: email,
          uID: uID,
          school: school,
          permission: "Student",
          courses: courses
        })
      });
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    });
  }

  render() {
    let $courseData;
    if (this.state.schools != null && this.state.loaded === true) {
      if (this.state.selectedSchool != "select") {
        console.log(this.state.selectedSchool)
        $courseData = (<div >
          <p>Select multiple classes that you are in</p>
          <br/>
          <div className="select is-multiple">
            <select multiple={true} onChange={this.coursesSelect} value={this.state.selectedSchool.courses}>
              {this.state.selectedSchool.courses.map((course, index) => (<option key={index}>{course}</option>))}
            </select>
          </div>
          <div className="select is-multiple">
            <select multiple={true} onChange={this.coursesDeselect} value={this.state.selectedCourses}>
              {this.state.selectedCourses.map((course, index) => (<option key={index}>{course}</option>))}
            </select>
          </div>
        </div>)
      } else {
        $courseData = (<p></p>)
      }
      if (this.state.nextPage){
        return(
          <div className="container">
          <form onSubmit={this.handleSignUp}>
          <p> Tell us which school you go to</p>

          <div className="select">
            <select onChange={this.schoolSelect} value={this.state.selectedSchool} name="school">
              <option value="select">Select</option>
              {this.state.schools.map((school, index) => (<option value={JSON.stringify(school)} key={index}>{school.name}</option>))}
            </select>
          </div>
          <br/>
          {$courseData}

          <div className="control">
            <button className="button">Submit</button>
          </div>
          </form>
          <button onClick={this.handleBack} id="cancelButton">
              Go Back
            </button>
          </div>
        )
      }
      return (<form onSubmit={this.handleFormData}>
        <div className="container">
          <div className="box">
            <div className="field">
              <label className="label">First Name</label>
              <div className="control">
                <input className="input" name="fname" type="text" placeholder="First Name"/>
              </div>
            </div>
            <div className="field">
              <label className="label">Last Name</label>
              <div className="control">
                <input className="input" name="lname" type="text" placeholder="Last Name"/>
              </div>
            </div>
            <div className="field">
              <label className="label">Email</label>
              <div className="control">
                <input className="input" name="email" type="email" placeholder="Email input"/>
              </div>
            </div>

            <div className="field">
              <label className="label">Password</label>
              <div className="control">
                <input className="input" name="password" type="text" placeholder="Password"/>
              </div>
            </div>

            <div className="field is-grouped">
              <div className="control">
                <button className="button">Submit</button>
              </div>
              <div id="cancelButton">
                <div className="control">
                  <Link to="/login">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>);
    } else {
      return (<p>Please Wait</p>)
    }
  }
}

export default SignUp;
