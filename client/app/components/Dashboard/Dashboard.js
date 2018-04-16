import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link} from 'react-router-dom';
import { Player, BigPlayButton } from 'video-react';
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
      vidURL: null,
      schoolVal: 'select',
      courseVal: 'select',
      reportID: null,
      reportVal: 'select',
      reportComment: '',
      available: false,
      reported: false,
      deleteID: null
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
    this.renderReportForm = this.renderReportForm.bind(this);
    this.reportChange = this.reportChange.bind(this);
    this.handleReport = this.handleReport.bind(this);
    this.reportImage = this.reportImage.bind(this);
    this.cancelReport = this.cancelReport.bind(this);
    this.enterComment = this.enterComment.bind(this);
    this.checkReport = this.checkReport.bind(this);
    this.viewAvailable = this.viewAvailable.bind(this);
    this.changeAvailable = this.changeAvailable.bind(this);
    this.viewAll = this.viewAll.bind(this);
    this.viewReports = this.viewReports.bind(this);
    this.changeReported = this.changeReported.bind(this);
    this.renderDeleteConfirmation = this.renderDeleteConfirmation.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
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
      this.getImageData(this.state.user.permission, this.state.user.uID, this.state.statusVal).then((images) => {
        images.sort(this.compare);
        this.setState({
          loaded: false,
          images: images
        }, () => {
          this.setState({loaded: true})
        })
        this.getImageURL(images).then((urlArray) => {
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getVideoURL(images).then((vidUrlArray) => {
          this.setState({
            vidURL: vidUrlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        }).then(()=>{
          this.getSchools().then((schools) => {
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
      if (this.state.available) {
        return (fetch(`/api/images?clientUID=${uID}&status=${"completed"}`, {
          headers: {
            "Content-Type": "Application/json"
          },
          method: 'GET'
        }).then(res => res.json()));
      } else if (status === "all"){
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
      if (this.state.reported){
        return (fetch(`/api/images?status=${"reported"}`, {
          headers: {
            "Content-Type": "Application/json"
          },
          method: 'GET'
        }).then(res => res.json()));
      } else {
      return (fetch(`/api/images`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()));
    }
  }
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

  async getVideoURL(images) {
    let vidUrlArray = new Array();
    let vidURL;
    let url;
    images.map((image, index) => {
      var params = {
        Bucket: bucketName,
        Key: image.videoURL
      };

  if(image.purchased==1){
    url = s3.getSignedUrl('getObject', params);
    vidUrlArray.push(url)
  }

    })
  return vidUrlArray

  }

  handleClaim(image) {
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
    let status;
    if (e){
      e.preventDefault();
      status = e.target.value;
    } else {
      status=this.state.statusVal;
    }
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
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getVideoURL(images).then((vidUrlArray) => {
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
        images.sort(this.compare);

        this.setState({
          loaded: false,
          images: images,
          statusVal: status
        }, () => {
          this.setState({loaded: true})
        })
        this.getImageURL(images).then((urlArray) => {
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getVideoURL(images).then((vidUrlArray) => {
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
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getVideoURL(images).then((vidUrlArray) => {
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
        images.sort(this.compare);

        this.setState({
          loaded: false,
          images: images,
          filterVal: course
        }, () => {
          this.setState({loaded: true})
        })
        this.getImageURL(images).then((urlArray) => {
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getVideoURL(images).then((vidUrlArray) => {
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
    let course
    if (e){
      e.preventDefault()
      course = e.target.value;
    } else {
      course = this.state.courseVal;
    }
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
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getVideoURL(images).then((vidUrlArray) => {
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
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getVideoURL(images).then((vidUrlArray) => {
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
    let selectedSchool
    if (e){
      e.preventDefault();
      selectedSchool = e.target.value;
    } else {
      selectedSchool = this.state.schoolVal;
    }

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
          this.setState({
            downloadURL: urlArray,
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
        this.getVideoURL(images).then((vidUrlArray) => {
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
        this.setState({
          downloadURL: urlArray,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        })
      })
      this.getVideoURL(images).then((vidUrlArray) => {
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

  handleReport(image){
    this.setState({
      reportID: image.imageURL,
      reportVal: 'select',
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  handleDelete(image){
    this.setState({
      deleteID: image.imageURL,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  renderDeleteConfirmation(image){
    if (this.state.deleteID === image.imageURL){
      return(
        <div className="control">
          <button onClick = {()=> {this.confirmDelete(image)}} className="button">Confirm Delete</button>
        </div>
      )
    }
    else return(<p></p>)
  }

  confirmDelete(image){
      var params = {
        Bucket: bucketName,
        Key: image.imageURL
      };
      s3.deleteObject(params, function(err, data){
        if (err)
        {
          console.log("error:",err)
        }
        else
        {
          console.log("Successfully deleted image!");
          // 
          // subject = "Submission Deleted";
          // message = "We have deleted your image submission of";
          //sendTheEmail()

        }
      })
      fetch(`/api/images?imageURL=${image.imageURL}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "Application/json"
        }
      }).then((image) => {
        this.filterImages().then(() => {
          this.filterStatus().then(() => {
          this.getImageURL(this.state.images).then((urlArray) => {
            this.setState({
              downloadURL: urlArray,
              deleteID: null,
              loaded: false
            }, () => {
              this.setState({loaded: true})
            })
          })
        })

      })
    })

  }

  reportChange(e){
    e.preventDefault();
    this.setState({
      reportVal: e.target.value,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  renderReportForm(image){
    if (this.state.reportID === image.imageURL){
      let $otherForm;
      if (this.state.reportVal === 'Other'){
        $otherForm = (

          <div className="field">
            <label className="label">Specify</label>
            <div className="control">
              <input className="input" onChange={this.enterComment} value={this.state.reportComment} name="report" type="text" placeholder="Specify Report"/>
            </div>
          </div>
        )
      } else {
        $otherForm = (<p></p>)
      }
      return (
        <form onSubmit={(e) => this.reportImage(e, image)}>
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
        </form>
      )
    } else {
      return(<p></p>)
    }
  }

  enterComment(e){
    e.preventDefault();
    this.setState({
      reportComment: e.target.value
    })
  }

  cancelReport(){
    this.setState({
      reportVal: 'select',
      reportID: null,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  checkReport(image){
    let $verboseReason;
    let $comment;
    if (image.status === "reported"){
      if (image.reportReason === "Other"){
        $verboseReason = "Other"
        $comment = image.reportComment;
      }
      else if (image.reportReason === "Inappropriate"){
        $verboseReason = "Inappropriate image/comment"
      }
      else if (image.reportReason === "Misplaced"){
        $verboseReason = "Wrong course tag for image content"
      }
      return (
        <div>
        <p>Report reason: {$verboseReason}</p>
        {$comment? <p>Comment from tutor: {$comment}</p>:<p></p>}
        <div className="control">
          <button onClick={()=>{this.restoreImage(image)}} className="button">Restore image</button>
        </div>
        </div>
      )
    } else {
      return(<p></p>)
    }
  }

  restoreImage(image){
    fetch(`/api/images?imageURL=${image.imageURL}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({status: "open", reportComment: "", reportReason: "", tutorUID: null})
    }).then((image) => {
      this.filterImages().then(() => {
        this.filterStatus().then(() => {
        this.getImageURL(this.state.images).then((urlArray) => {
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
  reportImage(e, image){
    e.preventDefault();
    if (this.state.reportComment != ""){
      const comment = this.state.reportComment;
      const imageURL = image.imageURL;
      fetch(`/api/images?imageURL=${imageURL}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({status: "reported", reportComment: comment, reportReason: this.state.reportVal})
      }).then((image) => {
        this.filterImages().then(() => {
          this.filterStatus().then(() => {
          this.getImageURL(this.state.images).then((urlArray) => {
            this.setState({
              downloadURL: urlArray,
              reportID: null,
              reportVal: 'select',
              reportComment: '',
              loaded: false
            }, () => {
              this.setState({loaded: true})
            })
          })
        })
      })
    })
  } else {
    const imageURL = image.imageURL;
    fetch(`/api/images?imageURL=${imageURL}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({status: "reported", reportReason: this.state.reportVal})
    }).then((image) => {
      this.filterImages().then(() => {
        this.filterStatus().then(() => {
        this.getImageURL(this.state.images).then((urlArray) => {
          this.setState({
            downloadURL: urlArray,
            reportID: null,
            reportVal: 'select',
            reportComment: '',
            loaded: false
          }, () => {
            this.setState({loaded: true})
          })
        })
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
    return((this.state.schoolVal === 'select') ? this.state.schoolVal : this.state.schoolVal.name)
  }

  async changeAvailable(value){
    this.setState({
      available: value,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  async changeReported(value){
    this.setState({
      reported: value,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  async viewAvailable(){
    this.changeAvailable(true).then(() =>{
    this.getImageData(this.state.user.permission, this.state.user.uID, this.state.statusVal).then((images) => {
      images.sort(this.compare);
      this.setState({
        loaded: false,
        images: images
      }, () => {
        this.setState({loaded: true})
      })
      this.getImageURL(images).then((urlArray) => {
        this.setState({
          downloadURL: urlArray,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        })
      })
      this.getVideoURL(images).then((vidUrlArray) => {
        this.setState({
          vidURL: vidUrlArray,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        })
      })
    })
  })
}

async viewReports() {
  this.changeReported(true).then(() =>{
  this.getImageData(this.state.user.permission, this.state.user.uID, this.state.statusVal).then((images) => {
    images.sort(this.compare);
    this.setState({
      loaded: false,
      images: images
    }, () => {
      this.setState({loaded: true})
    })
    this.getImageURL(images).then((urlArray) => {
      this.setState({
        downloadURL: urlArray,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      })
    })
    this.getVideoURL(images).then((vidUrlArray) => {
      this.setState({
        vidURL: vidUrlArray,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      })
    })
  })
})
}

async viewAll(type){
  let changefunc;
  if(type==="available"){
    changefunc = this.changeAvailable(false);
  } else if (type==="reported"){
    changefunc = this.changeReported(false);
  }
  changefunc.then(() =>{
  this.getImageData(this.state.user.permission, this.state.user.uID, this.state.statusVal).then((images) => {
    images.sort(this.compare);
    this.setState({
      loaded: false,
      images: images
    }, () => {
      this.setState({loaded: true})
    })
    this.getImageURL(images).then((urlArray) => {
      this.setState({
        downloadURL: urlArray,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      })
    })
    this.getVideoURL(images).then((vidUrlArray) => {
      this.setState({
        vidURL: vidUrlArray,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      })
    })
  })
})
}


  render() {
    let $url;
    let $courseData;
    if (this.state.user) {
      let $image;
      let $date;
      if (this.state.user.permission === "Tutor" && this.state.images && this.state.courses && this.state.downloadURL) {
        return (<div className="container">
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
              <div className="card">
                <div className="card-content">
                  <a href={this.state.downloadURL[index]} download="download"><img src={this.state.downloadURL[index]} width="75%" height="75%"/></a>
		            </div>
                <div className="media-content">
                  <p className="title is-4">{image.clientUID}</p>
                  <p className="subtitle is-6">{image.course}</p>
                </div>
                <div className="content">
                <p>Comments: {image.comment} </p>
                  <p>Date uploaded: {$date = this.getDateInformation(image.timestamp)}</p>
                </div>
                <button onClick={() => this.handleClaim(image)} className="button is-success">Claim image</button>
                <button onClick={() => this.handleReport(image)} className="button is-warning">Report Image</button>
                { this.renderReportForm(image) }
              </div>

              <br/>
            </div>))
          }
        </div>)
      } else if (this.state.user.permission === "Student" && this.state.images && this.state.courses && this.state.downloadURL && this.state.vidURL) {
        return (<div className="container">
        {!this.state.available ?
          (<div>
            <div className="control">
            <a onClick={this.viewAvailable}>View all available video</a>
          </div>
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
      </div>)
      : (
        <div className="control">
          <a onClick={()=>{this.viewAll("available")}}>View all</a>
        </div>
      )
    }
          {
            this.state.images.map((image, index) => (<div key={index}>

              <div className="card">
              <a href={this.state.downloadURL[index]} download="download"><img src={this.state.downloadURL[index]} width="75%" height="75%"/></a>

                <div className="card-content"></div>
                <div className="media-content">
                  <p className="title is-4">{image.clientUID}</p>
                  <p className="subtitle is-6">{image.course}</p>
                </div>
                <p>Comments: {image.comment} </p>
                <div className="content">
                  <p>Date uploaded: {$date = this.getDateInformation(image.timestamp)}</p>

                  {image.videoURL ? $url =(
                  <Player>
        						<source src={this.state.vidURL[index]} />
        					</Player> ) : $url = <p></p>}
                  {$url}
                </div>
              </div>
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
        {!this.state.reported ?
        (<div>
          <div className="control">
          <a onClick={this.viewReports}>View reports</a>
          </div>
          <div className="select">
            <select onChange={this.adminFilter} value={this.schoolVal}>
              <option value="select">Select</option>
              {this.state.schools.map((school, index) => (<option value={JSON.stringify(school)} key={index}>{school.name}</option>))}
            </select>
          </div>
          {$courseData}
          <br />
        </div>) :

        (<div className="control">
        <a onClick={()=>{this.viewAll("reported")}}>View all</a>
        </div>)
      }
          {
            this.state.images.map((image, index) => (
              <div key={index}>

              <div className="card">
              <button onClick={() => this.handleDelete(image)} className="button is-danger">Delete Image</button>
              { this.renderDeleteConfirmation(image) }
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
                  {image.comment?<p>comment: {image.comment}</p> : <p></p>}
                  {this.checkReport(image)}
                  <br />
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
