import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link} from 'react-router-dom';
import {NotificationContainer, NotificationManager} from 'react-notifications';

var firebase = require('firebase');
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

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
class Claims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false,
      images: null,
      courses: null,
      filterVal: 'select',
      downloadURL: null,
      reportID: null,
      reportVal: 'select',
      reportComment: "",
      videoError1: false,
      videoError2: false,
      reportError: false,
      commentError: false,
      students: null
    };
    this.getData = this.getData.bind(this);
    this.getImageData = this.getImageData.bind(this);
    this.submitVideo = this.submitVideo.bind(this);
    this.filterClaims = this.filterClaims.bind(this);
    this.compare = this.compare.bind(this);
    this.getImageURL = this.getImageURL.bind(this);
    this.renderReportForm = this.renderReportForm.bind(this);
    this.reportChange = this.reportChange.bind(this);
    this.handleReport = this.handleReport.bind(this);
    this.reportImage = this.reportImage.bind(this);
    this.cancelReport = this.cancelReport.bind(this);
    this.enterComment = this.enterComment.bind(this);
    this.handleStudentData = this.handleStudentData.bind(this)
  }

  async getUserData(UID){

    return(fetch(`/api/users?uID=${UID}`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()));
  }

  async handleStudentData(images){
    let students = await Promise.all(images.map(async image =>{
      return await this.getUserData(image.clientUID)
    }))
    return(students)
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
        this.handleStudentData(images).then((students)=>{
          this.setState({
            students: students,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getImageURL(images).then((urlArray) => {
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      });
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

  getImageData() {
    return (fetch(`/api/images?tutorUID=${this.state.user.uID}&status=${'claimed'}`, {
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
    images.map((image, index) => {
      var params = {
        Bucket: bucketName,
        Key: image.imageURL
      };

      url = s3.getSignedUrl('getObject', params)

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
    var hours = date.getHours();
    var mins = date.getMinutes();
    var seconds = date.getSeconds();
    var amPm = "AM";
    if (mins < 10) {
      mins = "0" + mins;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    if (hours > 12) {
      hours = hours - 12;
      amPm = "PM";
    }
    let dateInformation = (hours + ':' + mins + ':' + seconds + amPm + ', ' + day + ' ' + monthNames[monthIndex] + ' ' + year);
    return (dateInformation);
  }

  async filterClaims(e) {
    let course;
    if (e) {
      e.preventDefault();
      course = e.target.value;
    } else {
      course = this.state.filterVal
    }
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
        this.handleStudentData(images).then((students)=>{
          this.setState({
            students: students,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getImageURL(images).then((urlArray) => {
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      });
    } else {
      fetch(`/api/images?course=${course}&tutorUID=${this.state.user.uID}&status=${'claimed'}`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()).then((images) => {
        images.sort(this.compare);
        this.setState({
          loaded: false,
          images: images,
          filterVal: course
        }, () => {
          this.setState({loaded: true})
        })
        this.handleStudentData(images).then((students)=>{
          this.setState({
            students: students,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      });
    }
  }

  _handleFileChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({file: file, imagePreviewUrl: reader.result});
    }

	reader.readAsDataURL(file);

  }

  submitVideo(e, image) {

    e.preventDefault();

    email = this.state.user.email;
    firstname = this.state.user.fname;
    lastname = this.state.user.lname;

    if(!this.state.file){
      this.setState({
        videoError1: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }

    else{
      filename = this.state.file.name;

      var d = new Date();
      var timestamp = d.getTime();
      var uploadName = this.props.user.uid + '-' + timestamp;

      var extension = filename.split(".");
      if (extension.length === 1 || (extension[0] === "" && extension.length === 2)) {
        return "";
      }
      extension = extension.pop(); // feel free to tack .toLowerCase() here if you want
      uploadName = uploadName + '.' + extension;
      var keyName;
      extension = extension.toLowerCase();

      if (extension === "mp4" || extension === "wmv" || extension === "flv" || extension === "avi") {
        keyName = "Videos/"
      } else {
        this.setState({
          videoError2: true,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        });
      }

      if (!keyName) {
        this.setState({
          videoError2: true,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        });
      }

      if (keyName) {
        uploadName = keyName + uploadName;

        var params = {
          Bucket: bucketName,
          Key: uploadName,
          Body: file
        };

        const imageURL = image.imageURL;

		var video = document.createElement('video');
		var duration = 0;
		video.addEventListener('loadedmetadata', event => {
			duration = video.duration;
		})

		video.src = URL.createObjectURL(file)

        s3.putObject(params, ((err, data) => {
          if (err) {
            console.log(err)
          } else {

            fetch(`/api/images?imageURL=${imageURL}`, {
              method: 'PUT',
              headers: {
                "Content-Type": "Application/json"
              },
              body: JSON.stringify({videoURL: uploadName, status: "completed", duration: duration})
            }).then((image) => {
              this.getImageData().then((images) => {
                images.sort(this.compare)
                this.setState({
                  images: images,
                  loaded: false
                }, () => {
                  this.setState({loaded: true})
                });
                this.handleStudentData(images).then((students)=>{
                  this.setState({
                    students: students,
                    loaded: false
                  }, () => {
                    this.setState({loaded: true})
                  })
                })
                this.getImageURL(images).then((urlArray) => {
                  this.setState({
                    downloadURL: urlArray,
                    loaded: false
                  }, () => {
                    this.setState({loaded: true})
                  })
                })
              }).then(() => {
                NotificationManager.success('Video was successfully uploaded!', 'Success!');
              })
            });

            subject = "Submission Received!";
            message = "We have received your image submission of: " + filename + "!";
            sendTheEmail();
          }
        }))

      }
    }
}

  handleReport(image) {
    this.setState({
      reportID: image.imageURL,
      reportVal: 'select',
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  reportChange(e) {
    e.preventDefault();
    this.setState({
      reportVal: e.target.value,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  renderReportForm(image) {
    if (this.state.reportID === image.imageURL) {
      let $otherForm;
      if (this.state.reportVal === 'Other') {
        $otherForm = (<div className="field">
          <label className="label">Specify</label>
          {
            this.state.commentError
              ? <p style={{
                    color: 'red'
                  }}>Please specify</p>
              : <p></p>
          }

          <div className="control">
            <input className="input" onChange={this.enterComment} value={this.state.reportComment} name="report" type="text" placeholder="Specify Report"/>
          </div>
        </div>)
      } else {
        $otherForm = (<p></p>)
      }
      return (<form onSubmit={(e) => this.reportImage(e, image)}>
        {
          this.state.reportError
            ? <p style={{
                  color: 'red'
                }}>Please pick a reason</p>
            : <p></p>
        }

        <div className="select">
          <select onChange={this.reportChange} value={this.state.reportVal} name="report">
            <option value="select">Select</option>
            <option value="Inappropriate">Inappropriate Image/Comment</option>
            <option value="Misplaced">Wrong course tag for image content</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {$otherForm}
        <div className="control">
          <button className="button">Submit Report</button>
        </div>
        <div id="cancelButton">
          <div className="control">
            <button onClick={this.cancelReport} className="button">Cancel Report</button>
          </div>
        </div>
      </form>)
    } else {
      return (<p></p>)
    }
  }

  enterComment(e) {
    e.preventDefault();
    this.setState({reportComment: e.target.value})
  }

  cancelReport() {
    this.setState({
      reportVal: 'select',
      reportID: null,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  reportImage(e, image) {
    e.preventDefault();

    if (this.state.reportComment === "") {
      this.setState({
        commentError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      })
    }
    if (this.state.reportVal === 'select') {
      this.setState({
        reportError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      })
    }
    if (this.state.reportComment != "" && this.state.reportVal === 'Other') {
      const comment = this.state.reportComment;
      const imageURL = image.imageURL;
      fetch(`/api/images?imageURL=${imageURL}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({status: "reported", reportComment: comment, reportReason: this.state.reportVal})
      }).then((image) => {
        this.filterClaims().then(() => {
          this.getImageURL(this.state.images).then((urlArray) => {
            this.setState({
              downloadURL: urlArray,
              reportID: null,
              reportVal: 'select',
              reportComment: '',
              reportError: false,
              commentError: false,
              loaded: false
            }, () => {
              this.setState({loaded: true})
            })
          })
        })
      }).then(() => {
        NotificationManager.success('Report was sent to site admin.', 'Report success');
      })
    } else if (this.state.reportVal != 'select' && this.state.reportVal != 'Other') {
      const imageURL = image.imageURL;
      fetch(`/api/images?imageURL=${imageURL}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({status: "reported", reportReason: this.state.reportVal})
      }).then((image) => {
        this.filterClaims().then(() => {
          this.getImageURL(this.state.images).then((urlArray) => {
            this.setState({
              downloadURL: urlArray,
              reportID: null,
              reportVal: 'select',
              reportComment: '',
              reportError: false,
              commentError: false,
              loaded: false
            }, () => {
              this.setState({loaded: true})
            })
          })
        })
      }).then(() => {
        NotificationManager.success('Report was sent to site admin.', 'Report success');
      })
    }
  }

  render() {

    if (this.state.user && this.state.loaded) {
      if (this.state.user.permission === "Tutor" && this.state.images && this.state.courses && this.state.downloadURL && this.state.students) {
        let $image;
        let $date;
        return (<div className="container">

          <Link to="/Dashboard">Back to dashboard</Link>
          <p>Sort by course tag</p>
          <div className="select">
            <select onChange={this.filterClaims} value={this.state.filterVal} name="course">
              <option value="select">Select</option>
              {this.state.courses.map((course, index) => (<option key={index}>{course}</option>))}
            </select>
          </div>
          <br />
          <br />

          {
            this.state.images.map((image, index) => (<div key={index}>
              <div className="card">
                <form>

                  <div className="card-content">
                    <a href={this.state.downloadURL[index]} download="download"><img src={this.state.downloadURL[index]} width="75%" height="75%"/></a><br/>
                    <a href={this.state.downloadURL[index]} download="download">click here to download image</a>
                  </div>
                  <div className="media-content">
                    {this.state.students[index]?<p className="title is-4">{this.state.students[index].fname}</p>:<p></p>}
                    <p className="subtitle is-6">{image.course}</p>
                  </div>
                  <div className="content">
                    {$date = this.getDateInformation(image.timestamp)}
                  </div>
                  {
                    this.state.videoError1
                      ? <p style={{
                            color: 'red'
                          }}>Please add a file</p>
                      : <p></p>
                  }
                  {
                    this.state.videoError2
                      ? <p style={{
                            color: 'red'
                          }}>Please add a file with a supported type: mp4, wmv, flv, avi</p>
                      : <p></p>
                  }

                  <input className="fileInput" type="file" id="fileUp" onChange={(e) => this._handleFileChange(e)}/><br/>
                  <button className="button is-success" onClick={(e) => this.submitVideo(e, image)}>submit video</button>
                </form>
                <button onClick={() => this.handleReport(image)} className="button is-warning">Report Image</button>
                {this.renderReportForm(image)}
              </div>

              <br/>
            </div>))
          }
        </div>)
      } else if (!(this.state.user.permission === "Tutor")) {
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
