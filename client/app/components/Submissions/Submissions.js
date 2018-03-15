import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link} from 'react-router-dom';
import { Player, BigPlayButton } from 'video-react';
import "../../../../node_modules/video-react/dist/video-react.css"; // import css

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
class Submissions extends Component {
  constructor(props) {
    super(props);
    this.state = {
	  file: '',
      user: null,
      loaded: false,
      images: null,
      courses: null,
      filterVal: 'select',
      downloadURL: null,
	  vidURL: null
    };

    this.getData = this.getData.bind(this);
    this.getImageData = this.getImageData.bind(this);
	this.filterClaims = this.filterClaims.bind(this);
    this.compare = this.compare.bind(this);
    this.getImageURL = this.getImageURL.bind(this);
	this.getVideoURL = this.getVideoURL.bind(this);
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
        console.log("inside get image data submission")
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
        });
		this.getVideoURL(images).then((vidUrlArray) => {
          console.log("after get video?", vidUrlArray)
          this.setState({
            vidURL: vidUrlArray,
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
    return (fetch(`/api/images?clientUID=${this.state.user.uID}`, {
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

  async getVideoURL(images) {
    let vidUrlArray = new Array();
    let vidURL;
    let url;
    console.log("images", images)
    images.map((image, index) => {
      var params = {
        Bucket: bucketName,
        Key: image.videoURL
      };

	if(image.purchased==1){
		url = s3.getSignedUrl('getObject', params);
		vidUrlArray.push(url)
	}
    console.log(url);

    })
  return vidUrlArray

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
	var hours = date.getHours();
	var mins = date.getMinutes();
	var seconds = date.getSeconds();
	var amPm = "AM";
	if(mins < 10) { mins = "0" + mins; }
	if(seconds < 10) { seconds = "0" + seconds; }
	if(hours > 12) { hours = hours-12; amPm = "PM";}
    let dateInformation = (hours + ':' + mins + ':' + seconds + amPm +
	', ' + day + ' ' + monthNames[monthIndex] + ' ' + year);
    return (dateInformation);
  }

  filterClaims(e) {
    e.preventDefault();
    console.log("inside filter")
    const course = e.target.value;
    if (course === "select"){
      this.getImageData().then((images) => {
        images.sort(this.compare);

        this.setState({
          loaded: false,
          images: images,
          filterVal: course
        }, () => {
          this.setState({loaded: true})
        })
      });
    } else if (course === "completed"){
    console.log(course)
    return (fetch(`/api/images?status=${"completed"}&clientUID=${this.state.user.uID}`, {
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
  } else {
    console.log(course)
    return (fetch(`/api/images?course=${course}&clientUID=${this.state.user.uID}`, {
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

  _handleFileChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({file: file, imagePreviewUrl: reader.result});
    }

    reader.readAsDataURL(file)
  }


	// BUG: If there are more than one images with differing courses,
	// The first image will populate the image space as opposed to the
	// proper image that regards to that case.
  render() {

    if (this.state.user && this.state.loaded) {
      if (this.state.user.permission === "Student" && this.state.images && this.state.courses && this.state.downloadURL) {
        let $image;
        let $date;
        return (<div className="container">
          <Link to="/Dashboard">Back to dashboard</Link>
          <p>Sort by course tag</p>
          <div className="select">
            <select onChange={this.filterClaims} value={this.state.filterVal} name="course">
              <option value="select">Select</option>
			  <option value="completed">Completed</option>
              {this.state.courses.map((course, index) => (<option key={index}>{course.name}</option>))}
            </select>
          </div>

          {
            this.state.images.map((image, index) => (<div key={index}>
              <form>
                {console.log("renderImage", this.state.downloadURL[index])}
				{console.log("renderVideo", this.state.vidURL[index])}
                <div className="card">
                  <div className="card-content">
				  <img src={this.state.downloadURL[index]} width="75%" height="75%"/><br />
				  </div>
                  <div className="media-content">
                    <p className="title is-4">{image.clientUID}</p>
                    <p className="subtitle is-6">{image.course}</p>
                  </div>
                  <div className="content">
                    {$date = this.getDateInformation(image.timestamp)}
					<Player>
						<source src={this.state.vidURL[index]} />
					</Player>
                  </div>
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

export default Submissions;
