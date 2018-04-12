import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link} from 'react-router-dom';
import { Player, BigPlayButton } from 'video-react';
import PaymentForm from '../PaymentForm/PaymentForm';
import "../../../../node_modules/video-react/dist/video-react.css";

var firebase = require('firebase');
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

var accessKey;
var secretAccess;
var regionArea;

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
let file;
var filename;

// Will render a profile image, user name, user class list, user school,
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false,
      images: null,
      courses: null,
      filterVal: 'select',
      downloadURL: null,
      statusVal: 'all',
      schools: [],
      schoolVal: 'select',
      courseVal: 'select'
    };
    this.getData = this.getData.bind(this);
    this.getImageData = this.getImageData.bind(this);
    this.handleClaim = this.handleClaim.bind(this);
    this.filterImages = this.filterImages.bind(this);
    this.getDateInformation = this.getDateInformation.bind(this);
    this.compare = this.compare.bind(this);
    this.getImageURL = this.getImageURL.bind(this);
    this.getVideoURL = this.getVideoURL.bind(this);
    this.filterStatus = this.filterStatus.bind(this);
    this.getSchools = this.getSchools.bind(this);
    this.adminFilter = this.adminFilter.bind(this);
    this.adminCourseFilter = this.adminCourseFilter.bind(this);
    this.check = this.check.bind(this);
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

  getSchools() {
    return (fetch(`/api/schools`, {
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
    }).then(() => {
		console.log("IMAGES START");
		console.log("Permission is: ", this.state.user.permission);
      this.getImageData(this.state.user.permission, this.state.user.uID, this.state.statusVal).then((images) => {
		  console.log("Images: ", images);
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
        this.getVideoURL(images).then((vidUrlArray) => {
          console.log("after get video?", vidUrlArray)
          this.setState({
            vidURL: vidUrlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        }).then(()=>{
          console.log("here")
          this.getSchools().then((schools) => {
            console.log("schools", schools)
            this.setState({
              schools: schools,
              loaded: false
            }, () => {
              this.setState({loaded: true})
            });
          });
        })
      })
      })
  };

  getImageData(permission, uID, status) {
    if (permission === "Student") {
      if (status === "all"){
      return (fetch(`/api/images?clientUID=${uID}`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()));
    }
    else if (status === "open" || status === "completed"){
      return (fetch(`/api/images?clientUID=${uID}&status=${status}`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()));
    }
  } else if (permission === "Tutor") {
      return (fetch(`/api/images?school=${this.state.user.school.name}&status=${'open'}`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()));
    } else if (permission === "Admin") {
      return (fetch(`/api/images`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()));
    }
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

  handleClaim(e, image) {
    e.preventDefault();
    const imageURL = image.imageURL;
    fetch(`/api/images?imageURL=${imageURL}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({status: "claimed", tutorUID: this.state.user.uID})
    }).then((image) => {
      this.filterImages().then(() => {
        this.filterStatus().then(() => {
        this.getImageURL(this.state.images).then((urlArray) => {
          console.log("after get image?", urlArray)
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      })

    })
  })
}

  async filterStatus(e) {
    e.preventDefault();
    status = e.target.value;
    console.log("status", status)
    if (this.state.filterVal === "select"){
      this.getImageData(this.state.user.permission, this.state.user.uID, status).then((images) => {
        images.sort(this.compare);
        this.setState({
          loaded: false,
          images: images,
          statusVal: status
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
    } else {
      let url;
      if (status === "all") {
        if (this.state.user.permission === "Tutor"){
          url= `/api/images?course=${course}&school=${this.state.user.school.name}&status=${'open'}`
        } else if (this.state.user.permission === "Student"){
        url = `/api/images?course=${this.state.filterVal}&clientUID=${this.state.user.uID}`
      } else {
        url = `/api/images?course=${this.state.filterVal}`
        }
      } else {
        url = `/api/images?course=${this.state.filterVal}&status=${status}&clientUID=${this.state.user.uID}`
      }
      return (fetch(url, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()).then((images) => {
        console.log(images);
        images.sort(this.compare);

        this.setState({
          loaded: false,
          images: images,
          statusVal: status
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
        this.getVideoURL(images).then((vidUrlArray) => {
          console.log("after get video?", vidUrlArray)
          this.setState({
            vidURL: vidUrlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      }));
    }
  }

  async filterImages(e) {
    let course;
    if (e) {
      e.preventDefault();
      course = e.target.value;
    } else {
      course = this.state.filterVal
    }
    console.log("inside filter")
    if (course === "select") {
      this.getImageData(this.state.user.permission, this.state.user.uID, this.state.statusVal).then((images) => {
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
    } else {
      let url;
      console.log(course)
      console.log("status inside course filter", this.state.statusVal)
      if (this.state.statusVal === "all" && this.state.user.permission === "Student") {
        url = `/api/images?course=${course}&clientUID=${this.state.user.uID}&school=${this.state.user.school.name}`
      } else if(this.state.user.permission === "Tutor") {
        url = `/api/images?course=${course}&school=${this.state.user.school.name}&status=${'open'}`
      } else {
        url = `/api/images?course=${course}&status=${this.state.statusVal}&clientUID=${this.state.user.uID}`
      }
      return (fetch(url, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()).then((images) => {
        console.log(images);
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
        this.getVideoURL(images).then((vidUrlArray) => {
          console.log("after get video?", vidUrlArray)
          this.setState({
            vidURL: vidUrlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      }));
    }
  }

  async adminCourseFilter(e){
    e.preventDefault()
    let course = e.target.value;
    if (course === 'select'){
      let images = (fetch(`/api/images?school=${this.state.schoolVal.name}`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json())).then((images) => {
        images.sort(this.compare);
        this.setState({
          loaded: false,
          images: images,
          schoolVal: 'select'
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
        this.getVideoURL(images).then((vidUrlArray) => {
          console.log("after get video?", vidUrlArray)
          this.setState({
            vidURL: vidUrlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      })
    } else {
      let images = (fetch(`/api/images?school=${this.state.schoolVal.name}&course=${course}`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json())).then((images) => {
        images.sort(this.compare);
        this.setState({
          loaded: false,
          images: images,
          courseVal: course
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
        this.getVideoURL(images).then((vidUrlArray) => {
          console.log("after get video?", vidUrlArray)
          this.setState({
            vidURL: vidUrlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      })
    }
  }

  async adminFilter(e){
    e.preventDefault();
    let selectedSchool = e.target.value;
    if (selectedSchool === 'select'){
      this.getImageData(this.state.user.permission, this.state.user.uID, this.state.statusVal).then((images) => {
        images.sort(this.compare);
        this.setState({
          loaded: false,
          images: images,
          schoolVal: 'select'
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
        this.getVideoURL(images).then((vidUrlArray) => {
          console.log("after get video?", vidUrlArray)
          this.setState({
            vidURL: vidUrlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
      })
    }
    else {
    var school = JSON.parse(selectedSchool);
    let images = (fetch(`/api/images?school=${school.name}`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json())).then((images) => {
      images.sort(this.compare);
      this.setState({
        images: images,
        schoolVal: school,
        loaded: false
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
      this.getVideoURL(images).then((vidUrlArray) => {
        console.log("after get video?", vidUrlArray)
        this.setState({
          vidURL: vidUrlArray,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        })
      })
    })
  }
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

  compare(a, b) {
    if (a.timestamp < b.timestamp) {
      return -1;
    }
    if (a.timestamp > b.timestamp) {
      return 1;
    }
    return 0;
  }

  check(){
    console.log("check result", (this.state.schoolVal === 'select') ? this.state.schoolVal : this.state.schoolVal.name)
    return((this.state.schoolVal === 'select') ? this.state.schoolVal : this.state.schoolVal.name)
  }

  render() {
    let $url;
    let $courseData;
    if (this.state.user) {
      console.log(this.state.user.permission)
      let $image;
      let $date;
      if (this.state.user.permission === "Tutor" && this.state.images && this.state.courses && this.state.downloadURL) {

        return (<div className="container">
          <p>tutor view</p>
          <Link to="/Claims">View claimed clients</Link>
          <br/>
          <br/>
          <div className="select">
            <select onChange={this.filterImages} value={this.state.filterVal} name="course">
              <option value="select">Select</option>
              {this.state.user.courses.map((course, index) => (<option key={index}>{course}</option>))}
            </select>
          </div>


          {
            this.state.images.map((image, index) => (<div key={index}>

              {console.log("renderImage", this.state.downloadURL[index])}
              <div className="card">
                <div className="card-content">
                  <a href={this.state.downloadURL[index]} download="download"><img src={this.state.downloadURL[index]} width="75%" height="75%"/></a>
		            </div>
                <div className="media-content">
                  <p className="title is-4">{image.clientUID}</p>
                  <p className="subtitle is-6">{image.course}</p>
                </div>
                <div className="content">
                  <p>Date uploaded: {$date = this.getDateInformation(image.timestamp)}</p>
                </div>
                <button onClick={(e) => this.handleClaim(e, image)} className="button is-success">Claim image</button>
              </div>

              <br/>
            </div>))
          }
        </div>)
      } else if (this.state.user.permission === "Student" && this.state.images && this.state.courses && this.state.downloadURL) {
        return (<div className="container">
        <div className="select">
          <select onChange={this.filterImages} value={this.state.filterVal} name="course">
            <option value="select">Select</option>
            {this.state.courses.map((course, index) => (<option key={index}>{course}</option>))}
          </select>
        </div>
        <div className="select">
          <select onChange={this.filterStatus} value={this.state.statusVal} name="status">
            <option value="all">All</option>
            <option value="open">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
          {
            this.state.images.map((image, index) => (<div key={index}>

              <div className="card">
              <a href={this.state.downloadURL[index]} download="download"><img src={this.state.downloadURL[index]} width="75%" height="75%"/></a>

                <div className="card-content"></div>
                <div className="media-content">
                  <p className="title is-4">{image.clientUID}</p>
                  <p className="subtitle is-6">{image.course}</p>
                </div>
                <div className="content">
                  <p>Date uploaded: {$date = this.getDateInformation(image.timestamp)}</p>
                  {this.state.vidURL[index] ? $url =(
                  <Player>
        						<source src={this.state.vidURL[index]} />
        					</Player> ) : $url = <p></p>}
                </div>
              </div>

			  <PaymentForm image={image} />

              <br/>
            </div>))
          }
        </div>);
      } else if (this.state.user.permission === "Admin" && this.state.images && this.state.schools && this.state.downloadURL) {
        if (this.state.schoolVal!="select"){
          $courseData = (
            <div className="select">
            <select onChange={this.adminCourseFilter} value={this.state.courseVal}>
              <option value="select">Select</option>
                {this.state.schoolVal.courses.map((course, index) => (<option key={index}>{course}</option>))}
            </select>
            </div>
          )
        } else $courseData = (<p></p>)
        return (<div className="container">
        <div className="select">
        {console.log("school val:",this.state.schoolVal)}
          <select onChange={this.adminFilter} value={this.schoolVal}>
            <option value="select">Select</option>
              {this.state.schools.map((school, index) => (<option value={JSON.stringify(school)} key={index}>{school.name}</option>))}
            </select>
        </div>
        {$courseData}
        <br />
          {
            this.state.images.map((image, index) => (
              <div key={index}>

              <div className="card">
                <a href={this.state.downloadURL[index]} download="download"><img src={this.state.downloadURL[index]} width="75%" height="75%"/></a>

                <div className="card-content"></div>
                <div className="media-content">
                  <p className="title is-4">{image.clientUID}</p>
                  <p className="subtitle is-6">{image.course}</p>
                  <br />
                </div>
                <div className="content">
                  <p>Date uploaded: {$date = this.getDateInformation(image.timestamp)}</p>
                  <p>Status: {image.status}</p>

                  {image.tutorUID && <p>Tutor UID: {image.tutorUID}</p>}
                  <p>school: {image.school}</p>
                </div>
              </div>
              <br/>
            </div>))
          }
        </div>);
      } else {
        return (<h1>Please wait</h1>)
      }
    } else {
      return (<h1>Please wait</h1>)
    }

  }
}

export default Dashboard;
