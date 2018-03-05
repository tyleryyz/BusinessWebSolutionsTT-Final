import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link} from 'react-router-dom';

var firebase = require('firebase');

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

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

fetchTextFile('keys.txt', function(data) {
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
AWS.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretAccess,
    region: regionArea,
});

// Create an S3 client
var s3 = new AWS.S3();
var ses = new AWS.SES();

// Create a bucket and upload something into it
//var bucketName = 'jjg297-' + uuid.v4();
var bucketName = 'tailored-tutoring';
var keyName;
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
class Claims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false,
      images: null,
      courses: null,
      filterVal: 'select',
      downloadURL: null
    };
    this.getData = this.getData.bind(this);
    this.getImageData = this.getImageData.bind(this);
    this.submitVideo = this.submitVideo.bind(this);
    this.filterClaims = this.filterClaims.bind(this);
    this.compare = this.compare.bind(this);
    this.getImageURL = this.getImageURL.bind(this);
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
      console.log("will mount here", user)
      this.setState({
        user: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }).then(() => {
      let imageData = this.getImageData().then((images) => {
        images.sort(this.compare);
        this.setState({
          loaded: false,
          images: images
        }, () => {
          this.setState({loaded: true})
        })
        this.getImageURL(images).then((urlArray) => {
          console.log("after get image?", urlArray)
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      });
    }).then(() => {
      this.getCourses().then((courses) => {
        console.log("courses", courses)
        this.setState({
          courses: courses,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        })
      })
    })
  };

  compare(a, b) {
    if (a.timestamp < b.timestamp) {
      return -1;
    }
    if (a.timestamp > b.timestamp) {
      return 1;
    }
    return 0;
  }

  getCourses() {
    console.log("inside courses")
    return (fetch(`/api/courses`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  getImageData() {
    console.log("here", this.state.uID)
    return (fetch(`/api/images?tutorUID=${this.state.user.uID}`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  async getImageURL(images) {
    let urlArray = new Array();
    let downloadURL;
    let url;
    console.log("images", images)
    images.map((image, index) => {
      var params = {
        Bucket: bucketName,
        Key: image.imageURL
      };

    url = s3.getSignedUrl('getObject', params)
    console.log(url)

      urlArray.push(url)


    })
  return urlArray

  }

  getDateInformation(timestamp) {
    let date = new Date(timestamp);
    var monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    let dateInformation = (day + ' ' + monthNames[monthIndex] + ' ' + year)
    return (dateInformation)
  }

  filterClaims(e) {
    e.preventDefault();
    console.log("inside filter")
    const course = e.target.value;
    if (course === "select") {
      this.getImageData().then((images) => {
        images.sort(this.compare);

        this.setState({
          loaded: false,
          images: images,
          filterVal: course
        }, () => {
          this.setState({loaded: true})
        })
        this.getImageURL(images).then((urlArray) => {
          console.log("after get image?", urlArray)
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      });
    } else {
      console.log(course)
      return (fetch(`/api/images?course=${course}&tutorUID=${this.state.user.uID}`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()).then((images) => {
        images.sort(this.compare);

        console.log(images);
        this.setState({
          loaded: false,
          images: images,
          filterVal: course
        }, () => {
          this.setState({loaded: true})
        })
      }));
    }
  }
  
  submitVideo(e, image) {
	  
	e.preventDefault();
	
	email = this.props.user.email;
	firstname = this.state.user.fname;
	lastname = this.state.user.lname;
	
	console.log(firstname + " " + lastname + " " + email);
	console.log(file.name);
	
	filename = this.state.file.name;
	
	var d = new Date();
	var timestamp = d.getTime();
	var uploadName = this.props.user.uid+'-'+timestamp;

	var extension = filename.split(".");
	if( extension.length === 1 || ( extension[0] === "" && extension.length === 2 ) ) {
		return "";
	}
	extension = extension.pop();    // feel free to tack .toLowerCase() here if you want
	uploadName = uploadName+'.'+extension;
	var keyName;
  extension = extension.toLowerCase();

	if (extension=="mp4" || extension=="wmv" || extension=="flv" || extension=="avi")
	{
		keyName = "Videos/"
	} else {
		console.log("Invalid file type!")
	}
	
	uploadName = keyName+uploadName;

	var params = {
	  Bucket: bucketName,
	  Key: uploadName,
	  Body: file
	};
	
	console.log(uploadName);
	
	const imageURL = image.imageURL;
    fetch(`/api/images?imageURL=${imageURL}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({
		  videoURL: uploadName,
		  status: "completed" })
    }).then((image) => {
      this.getImageData().then((images) => {
        this.setState({
          images: images,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        });
      })
    });
	
	s3.putObject(params, function(err, data) {
	   if (err)
	   {
	     console.log(err)
	   }
	   else
	   {
	     console.log("Successfully uploaded data to: " + bucketName + "/" + uploadName);
	     
	     subject = "Submission Received!";
	     message = "We have received your image submission of: "+filename+"!";
	     sendTheEmail();
	   }
	 })

	console.log('Handling uploading, data presented: ', this.state.file);

  }

    render() {

    if (this.state.user && this.state.loaded) {
      if (this.state.user.permission === "Tutor" && this.state.images && this.state.courses && this.state.downloadURL) {
        let $image;
        let $date;
        return (<div className="container">
          <p>tutor view</p>
          <Link to="/Dashboard">Back to dashboard</Link>
          <p>Sort by course tag</p>
          <div className="select">
            <select onChange={this.filterClaims} value={this.state.filterVal} name="course">
              <option value="select">Select</option>
              {this.state.courses.map((course, index) => (<option key={index}>{course.name}</option>))}
            </select>
          </div>

          {
            this.state.images.map((image, index) => (<div key={index}>
              <form onClick={this.submitVideo(image)}>
                {console.log("renderIMage", this.state.downloadURL[index])}
                <div className="card">
                  <a href={this.state.downloadURL[index]} download>click here to download image</a>

                  <div className="card-content"></div>
                  <div className="media-content">
                    <p className="title is-4">{image.clientUID}</p>
                    <p className="subtitle is-6">{image.course}</p>
                  </div>
                  <div className="content">
                    {$date = this.getDateInformation(image.timestamp)}
                  </div>
                  <button className="button is-success">submit video</button>
                </div>
              </form>
              <br/>
            </div>))
          }
        </div>)
      } else if (!this.state.user.permission === "Tutor") {
        return (<div>
          <p>You do not have permission to view this page</p>
        </div>);
      } else {
        return null;
      }
    } else {
      return (<div>
        <h1>Please wait</h1>
      </div>)
    }

  }
}

export default Claims;