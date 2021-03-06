import React, {Component} from 'react';
import 'whatwg-fetch';

import {NotificationContainer, NotificationManager} from 'react-notifications';
import '../../styles/bulma.css';

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

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        file: '',
        imagePreviewUrl: '',
        user: null,
        loaded: false,
        courses: null,
        comment: "",
        courseSelectError: false,
        imageNullError: false
  };
    this.getData = this.getData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  componentWillMount() {
    let result = this.getData().then((user) => {
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
    let comments;
    e.preventDefault();
    const course = e.target.elements.course.value;
    if (!e.target.elements.comments.value){
      comments = "";
    } else {
      comments = e.target.elements.comments.value;
    }
    if (!file) {
   this.setState({
     imageNullError: true,
     loaded: false
   }, () => {
     this.setState({loaded: true})
   })
 }

 if (course === "select") {
   this.setState({
     courseSelectError: true,
     loaded: false
   }, () => {
     this.setState({loaded: true})
   })
}
    if (!(course==="select")&&(file)){
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

    if(extension==="png" || extension==="jpg" || extension==="jpeg")
    {
        keyName = "Images/";
    } else if (extension==="mp4" || extension==="wmv" || extension==="flv" || extension==="avi")
    {
        keyName = "Videos/"
    }

    var params = {
      Bucket: bucketName,
      Key: keyName+uploadName,
      Body: file
    };

    let key = keyName+uploadName;
    s3.putObject(params, ((err, data) =>{
      if (err)
      {
        NotificationManager.error('Error uploading image, please try again later', 'Error');
      }
      else
      {
        console.log("Successfully uploaded data to " + bucketName + " Images/" + uploadName);
        firstname = "this.props.user.firstname";
        lastname = "this.props.user.lastname";
        subject = "Submission Received!";
        message = "We have received your image submission of: "+filename+"!";
        sendTheEmail();

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
          comment: comments,
          school: this.state.user.school.name,
          timestamp: timestamp,
          videoURL: null,
          purchased: 0})
        });

      this.setState({
       courseSelectError: false,
       imageNullError: false,
       loaded: false
     }, () => {
       this.setState({loaded: true})
     })
     NotificationManager.success('Your image was successfully uploaded!', 'Success!');

      }
    }))


    }

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
      $imagePreview = (
        <div className="previewText" style={{ width: "170%"}}>
          <p>Please upload your Homework Image File.</p>
          <p><i>(Acceptable formats are: .jpg, .jpeg, .png)</i></p>
          <p>1 Minute of Video Solution = $1 cost</p>
      </div>);
    }

    let $pageData;
    if (this.state.courses){
    $pageData = (
      <div className="block">
      <div className="previewComponent">
      <form onSubmit={this.handleSubmit}>
      {
              this.state.imageNullError
                ? <p style={{
                      color: 'red'
                    }}>Please select an image before proceeding</p>
                : <p></p>
}
        <input className="fileInput" type="file" onChange={(e) => this._handleImageChange(e)}/><br /><br />
        <div className="imgPreview image is-128x128">
          {$imagePreview}
          </div><br />
          {
            this.state.courseSelectError
              ? <p style={{
                    color: 'red'
                  }}>Please enter a course tag before submitting an image</p>
              : <p></p>
}
          <p>Select course tag below:</p>
        <div className="select">
          <select name="course">
          <option value="select">Select</option>
          {this.state.user.courses.map((course, index) => (
            <option key={index}>{course}</option>
          ))}
          </select>
          <br />
        </div>
        <div className="field">
          <label className="label">Comments (optional)</label>
          <div className="control">
            <input className="input" name="comments" type="text" placeholder="Comments"/>
          </div>
        </div>
        <button className="button" style={{ backgroundColor: "#22d0b2"}} type="submit">Upload Image</button>
      </form>
    </div>
  </div>)
  } else {$pageData = (<p>Please Wait</p>)}
    if (this.state.user && this.state.user && this.state.courses){
    return (<div>
      {$pageData}
    </div>)
  } else {return (<p>Please Wait</p>)}
}
}

export default ImageUpload;
