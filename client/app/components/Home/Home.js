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

// Init variables
var firstname;
var lastname;
var email;
var message;
var subject;

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
var ses = new AWS.SES();

// Create a bucket and upload something into it
//var bucketName = 'jjg297-' + uuid.v4();
var bucketName = 'tailored-tutoring';
var keyName = 'hello_world.txt';
let file;
var filename;

function sendTheEmail() {

  const ses = new AWS.SES();

  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: '<strong>First Name:</strong> ' + firstname + '<br><strong>Last Name:</strong> ' + lastname + '<br><strong>Email to:</strong> ' + email + '<br>Subject: ' + subject + '<br>Message: ' + message
        },
        Text: {
          Charset: 'UTF-8',
          Data: 'First Name: ' + firstname + '\nLast Name: ' + lastname + '\nEmail to: ' + email + '\nSubject: ' + subject + '\nMessage: ' + message
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    ReturnPath: 'jjg297@nau.edu',
    Source: 'jjg297@nau.edu'
  };

  ses.sendEmail(params, (err, data) => {
    if (err)
      console.log(err, err.stack)
    else
      console.log(data)
  });
}

// Will render a profile image, user name, user class list, user school,
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: '',
      user: null,
      loaded: false,
      courses: null,
      clicked: false,
      submitImageSubject: null
    };
    this.getData = this.getData.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
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
    console.log(uID)
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
      console.log("will mount here", user)
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

  render() {

    if (this.state.user && this.state.loaded) {
		let {imagePreviewUrl} = this.state;
	    let $imagePreview = null;

	    if (imagePreviewUrl) {
	      $imagePreview = ( <a href={imagePreviewUrl} download="download"><img
                         src={imagePreviewUrl}
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
  						               <img src={profImage} />
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
                    <div className="button">
                      <Link to="/EditProfile">Edit Profile</Link>
                    </div>
                  </div>

              </div>{/* close columns */}

            </div>
          </section>
          {/* use to end "block" div here */}

        <div className="block" id="bottomBlock">

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
      </div>)
    } else {
      return (<div>
        <h1>Please wait</h1>
      </div>)
    }

  }
}

// <div id="editProfileButton">
// <div className="control">
//   <Link to="/EditProfile">Edit Profile</Link>
// </div>
// <p>{this.state.user.fname}</p>
// <p>{this.state.user.school.name}</p>
// <ul>
// {this.state.user.courses.map((course, index) => (<li key={index}>{course}</li>))}
// </ul>

export default Home;
