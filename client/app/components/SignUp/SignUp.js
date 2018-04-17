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
      schools: [],
      selectedSchool: 'select',
      selectedCourses: [],
      loaded: false,
      fname: '',
      lname: '',
      email: '',
      password: null,
      nextPage: false,
      emailError: false,
      passwordError1: false,
      passwordError2: false,
      fnameError: false,
      lnameError: false,
      schoolError: false,
      courseError: false,
      fbError: null
    }
    this.getSchools = this.getSchools.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.schoolSelect = this.schoolSelect.bind(this);
    this.coursesSelect = this.coursesSelect.bind(this);
    this.coursesDeselect = this.coursesDeselect.bind(this);
    this.handleFormData = this.handleFormData.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.updateFname = this.updateFname.bind(this);
    this.updateLname = this.updateLname.bind(this);
    this.updateEmail = this.updateEmail.bind(this)
    this.addOneClass = this.addOneClass.bind(this);
  }

  componentWillMount() {
    this.getSchools().then((schools) => {
      this.setState({
        schools: schools,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    });
  }

  async schoolSelect(e) {
    let value = e.target.value;

    if (value != "select") {
      var school = JSON.parse(value);
    } else {
      var school = value;
    }
    this.setState({
      selectedSchool: school,
      courses: school.courses,
      selectedCourses: [],
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
    this.setState({
      selectedCourses: value,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  handleBack(e) {
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

  handleFormData(e) {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    const fname = e.target.elements.fname.value;
    const lname = e.target.elements.lname.value;

    if (!fname) {
      this.setState({
        fnameError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if (!lname) {
      this.setState({
        lnameError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if (!email) {
      this.setState({
        emailError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if (!password) {
      this.setState({
        passwordError1: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if (!(password.length >= 6)) {
      this.setState({
        passwordError2: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }

    if (email && password.length >= 6 && fname && lname) {

      this.setState({
        fname: fname,
        lname: lname,
        email: email,
        password: password,
        nextPage: true,
        loaded: false,
        emailError: false,
        passwordError1: false,
        passwordError2: false,
        fnameError: false,
        lnameError: false
      }, () => {
        this.setState({loaded: true})
      });
    }
  }

  updateFname(e) {
    e.preventDefault();
    this.setState({fname: e.target.value})
  }
  updateLname(e) {
    e.preventDefault();
    this.setState({lname: e.target.value})
  }
  updateEmail(e) {
    e.preventDefault();
    this.setState({email: e.target.value})
  }

  addOneClass() {
    this.setState({
      selectedCourses: this.state.selectedSchool.courses,
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
    let errorCode;
    let errorMessage;

    if (courses.length === 0) {

      this.setState({
        coursesError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }

    if (school === 'select') {
      this.setState({
        schoolError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }

    if (email && password && fname && lname && school != 'select' && courses.length >= 1) {
      firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
        var newUser = firebase.auth().currentUser;
        const uID = newUser.uid;
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
      }).catch((error) => {
        // Handle Errors here.
        errorCode = error.code;
        errorMessage = error.message;
        this.setState({
          fbError: errorMessage,
          selectedSchool: 'select',
          selectedCourses: [],
          nextPage: false,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        });
      });
    }
  }

  render() {
    let $courseData;
    if (this.state.schools != null && this.state.loaded === true) {
      if (this.state.nextPage) {
        if (this.state.selectedSchool != "select" && this.state.courses) {
          if (this.state.courses.length === 1) {
            $courseData = (<div>
              <p>Only one class available for that University</p>
              <br/>
              <p>{this.state.courses}
                <a onClick={this.addOneClass} className="button">Add Class</a>
              </p>
              <p>Your course list</p>
              <div className="select is-multiple">
                <select multiple="multiple" size="3" onChange={this.coursesDeselect} value={this.state.selectedCourses}>
                  {this.state.selectedCourses.map((course, index) => (<option value={course} key={index}>{course}</option>))}
                </select>
              </div>

            </div>)
          } else if (this.state.courses.length > 1) {
            $courseData = (<div>
              <p>Select multiple classes that you are in</p>
              <br/>
              <p>Available courses</p>
              <div className="select is-multiple">
                <select multiple="multiple" size="3" id="courses" onChange={this.coursesSelect} value={this.state.selectedSchool.courses}>
                  {this.state.selectedSchool.courses.map((course, index) => (<option value={course} key={index}>{course}</option>))}
                </select>
              </div>
              <p>Your course list</p>
              <div className="select is-multiple">
                <select multiple="multiple" size="3" onChange={this.coursesDeselect} value={this.state.selectedCourses}>
                  {this.state.selectedCourses.map((course, index) => (<option value={course} key={index}>{course}</option>))}
                </select>
              </div>
            </div>)
          } else {
            $courseData = (<p></p>)
          }
        }
        return (<div className="container">
          <form onSubmit={this.handleSignUp}>
            <p>
              Tell us which school you go to</p>
            {
              this.state.schoolError
                ? <p style={{
                      color: 'red'
                    }}>Please select a school</p>
                : <p></p>
            }
            <div className="select">
              <select onChange={this.schoolSelect} value={JSON.stringify(this.state.selectedSchool)}>
                <option value="select">Select</option>
                {this.state.schools.map((school, index) => (<option value={JSON.stringify(school)} key={index}>{school.name}</option>))}
              </select>
            </div>
            <br/> {
              this.state.coursesError
                ? <p style={{
                      color: 'red'
                    }}>Please sign up for atleast one course you are in</p>
                : <p></p>
            }
            {$courseData}

            <div className="control">
              <button className="button">Submit</button>
            </div>
          </form>
          <div className="control">
            <button className="button" onClick={this.handleBack} id="cancelButton">
              Go Back
            </button>
          </div>
        </div>)
      } else if (!this.state.nextPage) {
        return (<form onSubmit={this.handleFormData}>
          <div className="container">
            <div className="box">
              <div className="field">
                <label className="label">First Name</label>
                {
                  this.state.fnameError
                    ? <p style={{
                          color: 'red'
                        }}>Please enter a first name</p>
                    : <p></p>
                }
                <div className="control">
                  <input className="input" onChange={this.updateFname} value={this.state.fname} name="fname" type="text" placeholder="First Name"/>
                </div>
              </div>
              <div className="field">
                <label className="label">Last Name</label>
                {
                  this.state.lnameError
                    ? <p style={{
                          color: 'red'
                        }}>Please enter a last name</p>
                    : <p></p>
                }
                <div className="control">
                  <input className="input" onChange={this.updateLname} value={this.state.lname} name="lname" type="text" placeholder="Last Name"/>
                </div>
              </div>
              <div className="field">
                <label className="label">Email</label>
                {
                  this.state.emailError
                    ? <p style={{
                          color: 'red'
                        }}>Please enter an email</p>
                    : <p></p>
                }
                {
                  this.state.fbError
                    ? <p style={{
                          color: 'red'
                        }}>{this.state.fbError}</p>
                    : <p></p>
                }
                <div className="control">
                  <input className="input" onChange={this.updateEmail} value={this.state.email} name="email" type="email" placeholder="Email input"/>
                </div>
              </div>

              <div className="field">
                <label className="label">Password</label>
                {
                  this.state.passwordError1
                    ? <p style={{
                          color: 'red'
                        }}>Please enter a password</p>
                    : <p></p>
                }
                {
                  this.state.passwordError2
                    ? <p style={{
                          color: 'red'
                        }}>Please enter a password greater than 6 characters</p>
                    : <p></p>
                }
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
    else {
      return (<p>Please Wait</p>)
    }
  }
}

export default SignUp;
