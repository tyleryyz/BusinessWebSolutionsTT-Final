import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link} from 'react-router-dom';

const testimage = require("../../../public/assets/img/poster.png")

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

function sendTheEmail()
{

  const ses = new AWS.SES();

  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data:
            '<strong>First Name:</strong> ' + firstname +
            '<br><strong>Last Name:</strong> ' + lastname +
            '<br><strong>Email to:</strong> ' + email +
            '<br>Subject: '+ subject +
            '<br>Message: ' + message
        },
        Text: {
          Charset: 'UTF-8',
          Data: 'First Name: ' + firstname + '\nLast Name: ' + lastname +
            '\nEmail to: ' + email + '\nSubject: ' + subject + '\nMessage: ' + message
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
      if (err) console.log(err, err.stack)
      else console.log(data)
    }
  );
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
	  clicked: false
    };
    this.getData = this.getData.bind(this);
	this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    this.setState({
      clicked: true
    });
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
		courses: user.courses,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  };

  render() {

    if (this.state.user && this.state.loaded) {

      return (
        <div>
        <section className="headerSection">
          <div style={{ textAlign: "center"}} className="block">
            <img src={testimage} />
            <h1 className="title">Tailored Tutoring Co.</h1>
            <h2 className="subtitle">roblokken@tailoredtutoringco.com</h2>
          </div>
        </section>

        <div className="block">
          <section className="hero is-primary">
            <div className="hero-body">

                <div className="columns">
                  <div className="column is-1">
                    <a href="">
                      <h2 className="subtitle">Image Here</h2>
                    </a>
                  </div>


                  <div className="column is-2">

                    <h2 style= {{fontSize: "22px" }} className="subtitle">
                    {this.state.user.fname}{" "}{this.state.user.lname}</h2>
                    <p className="heading">{this.state.user.school.name}</p>
                    {this.state.user.courses.map((subject, index) => (
                    <p key={index}>{subject}</p>
                    ))}

                    <button className="button">
                      <Link to="/EditProfile">Edit Profile</Link>
                    </button>

                  </div>
                </div> {/* close columns */}

            </div>
          </section>
        </div>

        <div className="block">
          <section className="subjectSection">
              <div className="container">
                <h1 className="title">My Subjects</h1>
                <h2 className="subtitle">
                  <div className="columns">
                  {/* My For-Loop essentially */}
                    {this.state.user.courses.map((subject, index) => (
                        <div key={index} className="column">
                          <a href="" style={{fontSize: "24px"}} >{subject}</a>
                          <button className="button" onClick={this.handleClick}>
                            <Link to="">Submit Assignment</Link>
                          </button>
                          <button className="button">
                            <Link to="">View Past Submissions</Link>
                          </button>
                        </div>
                    ))}
					{this.state.clicked ? <ImageUpload user={this.props.user}/> : null}
                  </div>
                </h2>
              </div> {/* close container, adds a margin */}
          </section>
        </div>
      </div> //close container


      )
    } else {
      return (<div>
        <h1>Please wait</h1>
      </div>)
    }

  }
}

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: '',
      user: this.props.user,
      loaded: this.props.loaded,
      courses: null
    };
    this.getData = this.getData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getData() {
	  console.log(this.state);
	  console.log(this.props)
    let uID = this.state.user.uid;
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
        courses: user.courses,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      })
      })
  }


  // When the Upload image button is clicked
  handleSubmit(e) {
    e.preventDefault();
    const course = e.target.elements.course.value;
    if (!(course==="select")){
    filename = this.state.file.name;
    var d = new Date();
    var timestamp = d.getTime();
    var uploadName = this.props.user.uid+'-'+timestamp;
    email = this.props.user.email;

    var extension = filename.split(".");
    if( extension.length === 1 || ( extension[0] === "" && extension.length === 2 ) ) {
        return "";
    }
    extension = extension.pop();    // feel free to tack .toLowerCase() here if you want
    uploadName = uploadName+'.'+extension;
    var keyName;
	extension = extension.toLowerCase();

    if(extension=="png" || extension=="jpg" || extension=="jpeg")
    {
        keyName = "Images/";
    } else if (extension=="mp4" || extension=="wmv" || extension=="flv" || extension=="avi")
    {
        keyName = "Videos/"
    }

    var params = {
      Bucket: bucketName,
      Key: keyName+uploadName,
      Body: file
    };

    let key = keyName+uploadName;
    s3.putObject(params, function(err, data) {
      if (err)
      {
        console.log(err)
      }
      else
      {
        console.log("Successfully uploaded data to " + bucketName + "Images/" + uploadName);
        firstname = "this.props.user.firstname";
        lastname = "this.props.user.lastname";
        subject = "Submission Received!";
        message = "We have received your image submission of: "+filename+"!";
        sendTheEmail();

      }
    })

    let image = fetch(`/api/images`, {
      method: 'POST',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({
		  clientUID: this.state.user.uID,
		  imageURL: key,
		  status: "open",
		  tutorUID: null,
		  course: course,
      school: this.state.user.school.name,
		  timestamp: timestamp,
		  videoURL: timestamp+"",
		  purchased: 0})
    });

    console.log(image)
    console.log('Handling uploading, data presented: ', this.state.file);
  } else console.log("enter a course tag")

  }

  // This changes the 'Please select an Image for Preview'
  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({file: file, imagePreviewUrl: reader.result});
    }

    reader.readAsDataURL(file)
  }

  // Render the screen in HTML
  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = null;

    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl}/>)
    } else {
      $imagePreview = (<div className="previewText">Please upload your question image!
      (Acceptable formats: jpg., .jpeg, .png)</div>);
    }

    let $pageData;
    if (this.state.courses){
    $pageData = (<div className="previewComponent">
      <form onSubmit={this.handleSubmit}>
        <input className="fileInput" type="file" onChange={(e) => this._handleImageChange(e)}/><br /><br />
        <div className="imgPreview image is-128x128">
          {$imagePreview}
        </div><br />
        <button className="submitButton" type="submit">Upload Image</button>
        <p>Select course tag</p>
        <div className="select">
          <select name="course">
          <option value="select">Select</option>
          {this.state.user.courses.map((course, index) => (
            <option key={index}>{course}</option>
          ))}
          </select>
          <br />
        </div>
      </form>
    </div>)
  } else {$pageData = (<p>Please Wait</p>)}
    if (this.state.user && this.state.user && this.state.courses){
    return (<div>
      {$pageData}
    </div>)
  } else {return (<p>Please Wait</p>)}
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
