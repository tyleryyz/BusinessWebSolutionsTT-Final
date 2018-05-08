import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link, Route, Switch, Router} from 'react-router-dom';

import ImageUpload from '../ImageUpload/ImageUpload';
import '../../styles/styles.css';
const testimage = require("../../../public/assets/img/poster.png")
const profImage = require("../../../public/assets/img/profile.png")
const ttcLogo = require("../../../public/assets/img/ttcLogo.png")

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var firebase = require('firebase');

// Init variables for the S3 object
var accessKey;
var secretAccess;
var regionArea;

fetchTextFile('http://localhost:8080/keys.txt', function(data) {
  updateVars(data)
});

// This function is meant to call the server side files and will read
// from the keys.txt file
function fetchTextFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', path, false);
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var words = httpRequest.responseText.split('\n');
        accessKey = words[0];
        secretAccess = words[1];
        regionArea = words[2];
        callback(words);
      }
    }
  };
  httpRequest.send();
}

function updateVars(data) {
  accessKey = data[0];
  secretAccess = data[1];
  regionArea = data[2];
}

// Update the Access Keys
AWS.config.update({accessKeyId: accessKey.trim(), secretAccessKey: secretAccess.trim(), region: regionArea.trim()});

// Create an S3 client
var s3 = new AWS.S3();

// Create a bucket and upload something into it
//var bucketName = 'jjg297-' + uuid.v4();
var bucketName = 'tailored-tutoring';



// Will render a profile image, user name, user class list, user school,
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: null,
      user: null,
      loaded: false,
      courses: null,
      clicked: false,
      schools: [],
      submitImageSubject: null
    };
    this.getData = this.getData.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFacebookNewUser = this.handleFacebookNewUser.bind(this);
    this.coursesSelect = this.coursesSelect.bind(this);
    this.coursesDeselect = this.coursesDeselect.bind(this);
    this.getSchools = this.getSchools.bind(this);
    this.schoolSelect = this.schoolSelect.bind(this);
  }

  handleClick(e, subject) {
    e.preventDefault();

    if (this.state.clicked) {
      this.setState({submitImageSubject: subject});
    } else {
      this.setState({
        clicked: !(this.state.clicked),
        submitImageSubject: subject
      });
    }
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

  async getProfileImage(){

	  var url;
	  var params = {
		  Bucket: bucketName,
		  Key: this.state.user.imageURL
	  };
	  url = s3.getSignedUrl('getObject', params);
	  return url;
  }

  componentWillMount() {
    let result = this.getData().then((user) => {
      this.setState({
        user: user,
        courses: user.courses,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
  }).then(() => {
	  this.getProfileImage().then((url) => {
		 this.setState({
   		   imagePreviewUrl: url,
           loaded: false
         }, () => {
           this.setState({loaded: true})
         });
	  })
  })
  this.getSchools().then((schools) => {
    this.setState({
      schools: schools,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  });
};

  handleFilter(e, subject) {
    e.preventDefault();
    this.props.filterCallBack(subject);
  }

  handleClose(e, subject) {
    e.preventDefault();
    this.setState({clicked: false, submitImageSubject: null});
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
        newUser: false,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }

    handleFacebookNewUser(e) {
      e.preventDefault();
      let user = this.props.user
      const nameArray = user.displayName.split(" ");
      const school = this.state.selectedSchool;
      const courses = this.state.selectedCourses;
      const fname = nameArray[0];
      const lname = nameArray[1];
      const email = user.email;
      const uID = user.uid;

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

      if (school != "select" && courses.length >= 1 && fname && lname && email) {
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
            courses: courses,
            permission: "Student"
          })
        }).then(()=>{
          let result = this.getData().then((user) => {
            this.setState({
              user: user,
              courses: user.courses,
              loaded: false
            }, () => {
              this.setState({loaded: true})
            });
        })
      })

    }
  }



  render() {
    let $courseData

    if (!this.state.user){
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
        <div style={{
            textAlign: "center"
          }} className="block">
          {/* <img src={testimage} /> */}
          <h1 className="title">Tailored Tutoring Co.</h1>
          {/* <h2 className="subtitle">roblokken@tailoredtutoringco.com</h2> */}
        </div>
        <form onSubmit={this.handleFacebookNewUser}>
        <h2>You appear to be a new user, please fill out some information below before continuing</h2>
        <br />
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
                  }}>Please sign up for at least one course you are in</p>
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
    }


    if (this.state.user && this.state.loaded) {
	    let $imagePreview = null;

	    if (this.state.imagePreviewUrl) {
	      $imagePreview = ( <a href={this.state.imagePreviewUrl} download="download"><img
                         src={this.state.imagePreviewUrl}
                         height={250} width={250} className="imgPreview is-128x128" /></a>)
	    } else {
	      $imagePreview = (<figure style={{ margin: "auto" }} className="image is-128x128">
							  <img src={profImage} />
							 </figure>);
	    }

      return (<div>
        <section className="hero" id="title-hero">
           <div style={{ textAlign: "center"}} className="block">
             <h1 className="title">Tailored Tutoring Co.</h1>
            {/* <h2 className="subtitle">roblokken@tailoredtutoringco.com</h2> */}
          </div>
        </section>


          {/*section gets Whole Background: */}
          <section className="hero" id="profile-data">
            <div className="hero-body" id="profile-body">

                <div className="columns is-centered">
                  <div className="column is-3 has-text-centered">
					             <figure style={{ margin: "auto" }} className="image is-128x128">
  						               {$imagePreview}
					             </figure>
					             <h2 style= {{fontSize: "22px", color: "white" }} className="subtitle">
                       {this.state.user.fname}{" "}{this.state.user.lname}</h2>
                  </div>

                  <div className="column is-8">
				             <br></br>

                    <p className="heading">{this.state.user.school.name}</p>
                    {this.state.user.courses.map((subject, index) => (
                    <p key={index}>{subject}</p>
                    ))}

				          </div>

                  <div className="column">

                  </div>

              </div>{/* close columns */}


            </div>
          </section>
          {/* use to end "block" div here */}
  {this.state.user.permission !="Admin"?
        <div className="block" id="bottomBlock">
        <Link id="linkTo" to="/EditProfile">Edit Profile</Link>




          <section className="subjectSection">
            <div className="container">

              <h1 className="subtitle has-text-centered">My Subjects</h1>
              <div className="columns is-centered">
                {/* My For-Loop essentially */}
                {
                  this.state.user.courses.map((subject, index) => (<div key={index} className="column has-text-centered is-3">
                    <div className="card">
                      <div className="card-content is-centered">
                        <div className="control subtitle is-text-dark" onClick={(e) => this.handleFilter(e, subject)}>
                          <Link to='/Dashboard'>{subject}</Link>
                        </div>
                        <br/>
                        <p>
                          <button className="button" onClick={(e) => this.handleClick(e, subject)}>
                            <Link to="">Submit Assignment</Link>
                          </button>
                        </p>
                        <br/>
                        <div className="button">
                          <Link to="/dashboard">View Past Submissions</Link>
                        </div>
                      </div>

                    </div>
                    {

                      (this.state.clicked && this.state.submitImageSubject === subject)
                        ? (<div className="is-centered">
                          <br/>
                          <ImageUpload user={this.props.user}/>
                          <br />
                            <a onClick={this.handleClose} className="button">Close</a>
                          </div>)
                        : <p></p>
                    }
                  </div>))
              }
              </div>

            </div>
            {/* close container, adds a margin */}
          </section>
        </div>
      :<p>        <Link id="linkTo" to="/EditProfile">Edit Profile</Link>
</p>}
      </div>)
    } else {
      return (<div>
        <h1>Please wait</h1>
      </div>)
    }

  }
}

export default Home;
