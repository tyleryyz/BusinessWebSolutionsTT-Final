import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import ProfileImage from '../ProfileImage/ProfileImage';
var firebase = require('firebase');
var firebaseui = require('firebaseui');

import '../../styles/bulma.css';


class EditProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false,
      selectedSchool: 'select',
      schools: null,
      fnameError: false,
      lnameError: false,
      fbError: null,
      fbPError: null,
      emailError: false,
      passwordError1: false,
      passwordError2: false,
      coursesError: false,
      schoolError: false,
      selectedCourses: [],
	  imageUploadClicked: false
    };
    this.getData = this.getData.bind(this);
    this.handleEditProfile = this.handleEditProfile.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.getSchools = this.getSchools.bind(this);
    this.schoolSelect = this.schoolSelect.bind(this);
    this.coursesSelect = this.coursesSelect.bind(this);
    this.coursesDeselect = this.coursesDeselect.bind(this);
    this.handleSchoolChange = this.handleSchoolChange.bind(this);
    this.addOneClass = this.addOneClass.bind(this);
	this.toggleImageUpload = this.toggleImageUpload.bind(this);

  }
  getData() {
    let uID = this.props.user.uid;
    return (fetch(`/api/users?uID=${uID}`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  getSchools() {
    return (fetch(`/api/schools`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  schoolSelect(e) {
    let value = e.target.value;
    if (value != "select"){
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

  addOneClass(){
    this.setState({
      selectedCourses: this.state.selectedSchool.courses,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
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

  componentWillMount() {
    let result = this.getData().then((user) => {
      this.setState({
        user: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }).then(() => {
      this.getSchools().then((schools) => {
        this.setState({
          schools: schools,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        });
      });
    })
  };

  handleEditProfile(e) {
    e.preventDefault();
    const fname = e.target.elements.fname.value;
    const lname = e.target.elements.lname.value;
    const email = this.state.user.email;

    if (!fname){
      this.setState({
        fnameError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if (!lname){
      this.setState({
        lnameError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if (fname && lname){
    fetch(`/api/users?email=${email}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({fname: fname, lname: lname})
    });
    this.getData().then((user) => {
      this.setState({
        user: user,
        lnameError: false,
        fnameError: false,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }).then(() => {
      NotificationManager.success('Your name was successfully updated!', 'Success!');
    })
  }
  }

  handleEmailChange(e) {
    e.preventDefault();
    const currentUser = this.props.user
    const newEmail = e.target.elements.email.value;
    const currentEmail = this.state.user.email;
    if (!newEmail){
      this.setState({
        emailError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if (newEmail){
    currentUser.updateEmail(newEmail).then(()=> {
      fetch(`/api/users?email=${currentEmail}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({email: newEmail})
      });
      this.getData().then((user) => {
        this.setState({
          user: user,
          fbError: null,
          emailError: false,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        });
      }).then(() => {
        NotificationManager.success('Your email was successfully updated!', 'Success!');
      })
    }).catch((error)=> {
      this.setState({
        fbError: error.message,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });

    });
  }

  }

  handlePasswordChange(e) {
    e.preventDefault();
    var user = this.props.user;
    var newPassword = e.target.elements.password.value;
    if (!newPassword){
      this.setState({
        passwordError1: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if (!(newPassword.length>=6)){
      this.setState({
        passwordError2: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if(newPassword.length>=6){
      user.updatePassword(newPassword).then(()=> {
        this.getData().then((user) => {
          this.setState({
            user: user,
            fbPError: null,
            passwordError1: false,
            passwordError2: false,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          });
        }).then(() => {
          NotificationManager.success('Your password was successfully updated!', 'Success!');
        })
    }).catch((error) => {
      this.setState({
        fbPError: error.message,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
      });
    }
  }

  handleSchoolChange(e){
    e.preventDefault();
    let email = this.state.user.email;


    if (this.state.selectedCourses.length === 0) {
      this.setState({
        coursesError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }

    if (this.state.selectedSchool === 'select') {
      this.setState({
        schoolError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }

    if (this.state.selectedSchool!='select' && this.state.selectedCourses.length>=1){
    fetch(`/api/users?email=${email}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({school: this.state.selectedSchool, courses: this.state.selectedCourses})
    });
    this.getData().then((user) => {
      this.setState({
        user: user,
        coursesError: null,
        schoolError: false,
        selectedSchool: 'select',
        selectedCourses: [],
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }).then(() => {
      NotificationManager.success('Your school and courses were successfully updated!', 'Success!');
    })
  }
  }

  toggleImageUpload(e){
	  e.preventDefault();
	  this.setState({
		  imageUploadClicked: !(this.state.imageUploadClicked),
		  loaded: false
	  }, () => {
		  this.setState({loaded: true})
	  });
  }

  render() {
    let $courseData;
      if (this.state.selectedSchool != "select" && this.state.courses) {
        if (this.state.courses.length === 1) {
            $courseData = (
              <div>
            <p>Only one class available for that University</p>
            {this.state.coursesError?<p style={{color: 'red'}}>Please select atleast one course to continue</p>:<p></p>}
            <br />
            <p>{this.state.courses}   <a onClick={this.addOneClass} className="button">Add Class</a></p>
            <p>Your course list</p>
            <div className="select is-multiple">
              <select multiple size="3" onChange={this.coursesDeselect} value={this.state.selectedCourses}>
                {this.state.selectedCourses.map((course, index) => (<option value={course} key={index}>{course}</option>))}
              </select>
            </div>

            </div>
          )
        } else if(this.state.courses.length>1) {
         $courseData = (
           <div>
           <p>Select multiple classes that you are in</p>
           {this.state.coursesError?<p style={{color: 'red'}}>Please select atleast one course to continue</p>:<p></p>}
           <br/>
           <p>Available courses</p>
           <div className="select is-multiple">
             <select multiple size="3" id="courses" onChange={this.coursesSelect} value={this.state.selectedSchool.courses}>
               {this.state.selectedSchool.courses.map((course, index) => (<option value={course} key={index}>{course}</option>))}
             </select>
           </div>
           <p>Your course list</p>
           <div className="select is-multiple">
             <select multiple size="3" onChange={this.coursesDeselect} value={this.state.selectedCourses}>
               {this.state.selectedCourses.map((course, index) => (<option value={course} key={index}>{course}</option>))}
             </select>
           </div>
         </div>)
       } else {$courseData = (<p></p>)}
     }

    if (this.state.user && this.state.loaded && this.state.schools) {
      return (<div className="container">

        <div className="box">

          <form onSubmit={this.handleEditProfile}>
            <div className="field">
              <label className="label">First Name: {this.state.user.fname}</label>
                {this.state.fnameError?<p style={{color: 'red'}}>Please enter a first name before continuing</p>:<p></p>}
              <div className="control">
                <input className="input" name="fname" type="text" placeholder="First Name"/>
              </div>
            </div>
            <div className="field">
              <label className="label">Last Name: {this.state.user.lname}</label>
                {this.state.lnameError?<p style={{color: 'red'}}>Please enter a last name before continuing</p>:<p></p>}
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
              <label className="label">Email: {this.state.user.email}
                (Warning: Changing this will affect your login!)</label>
                {this.state.emailError?<p style={{color: 'red'}}>Please enter a valid email before continuing</p>:<p></p>}
                {this.state.fbError?<p style={{color: 'red'}}>{this.state.fbError}</p>:<p></p>}
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
              {this.state.passwordError1?<p style={{color: 'red'}}>Please enter a password before continuing</p>:<p></p>}
              {this.state.passwordError2?<p style={{color: 'red'}}>Please enter a password greater than 6 characters</p>:<p></p>}
              {this.state.fbPError?<p style={{color: 'red'}}>{this.state.fbPError}</p>:<p></p>}

              <div className="control">
                <input className="input" name="password" type="text" placeholder="Password"/>
              </div>
            </div>
            <div className="control">
              <button className="button">Change Password</button>
            </div>
          </form>
        </div>

        <div className="box">
          <form onSubmit={this.handleSchoolChange}>
            <p>
              Edit School: {this.state.user.school.name}
              </p>
              <p>Courses:</p>
              <ul>
              {this.state.user.courses.map((course, index) => (<li key={index}>{course}</li>))}
              </ul>
              <br/>
              <p>Please choose a school</p>
              {this.state.schoolError?<p style={{color: 'red'}}>Please select a school to continue</p>:<p></p>}
            <div className="select">
              <select onChange={this.schoolSelect} value={JSON.stringify(this.state.selectedSchool)} name="school">
                <option value="select">Select</option>
                {this.state.schools.map((school, index) => (<option value={JSON.stringify(school)} key={index}>{school.name}</option>))}
              </select>
            </div>
            <br/>
            {$courseData}
            <br/>
            <div className="control">
              <button className="button">Change Information</button>
            </div>
          </form>
        </div>

		<div className="box">
			{this.state.imageUploadClicked ? <ProfileImage user={this.props.user} /> : <button className="button" onClick={this.toggleImageUpload}>Change Profile Picture</button> }
		</div>

        <div id="cancelButton">
          <div className="control">
            <Link to="/">Cancel</Link>
          </div>
        </div>
      </div>);
    } else
      return (<p>Please wait</p>)
  }
}

export default EditProfile;
