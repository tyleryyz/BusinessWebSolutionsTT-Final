import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link} from 'react-router-dom';

var firebase = require('firebase');

// Will render a profile image, user name, user class list, user school,
class Claims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false,
      images: null,
      courses: null,
      filterVal: 'select'
    };
    this.getData = this.getData.bind(this);
    this.getImageData = this.getImageData.bind(this);
    this.submitVideo = this.submitVideo.bind(this);
    this.filterClaims = this.filterClaims.bind(this);
    this.compare = this.compare.bind(this);
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

  compare(a,b) {
    if (a.timestamp < b.timestamp){
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

  getImage(imageURL) {
    //   var getParams = {
    //   Bucket: 'abc',
    //   Key: imageURL
    // }
    //
    // s3.getObject(getParams, function(err, data) {
    //   if (err)
    //       return err;
    //     });
  }

  getDateInformation(timestamp){
    let date = new Date(timestamp);
    var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
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

  submitVideo() {}

  render() {

    if (this.state.user && this.state.loaded) {
      if (this.state.user.permission === "Tutor" && this.state.images && this.state.courses) {
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
            this.state.images.map((image, index) => (
              <div key={index}>
              <form onClick={this.submitVideo(image)}>
              <p>{$image = this.getImage(image.imageURL)}</p>

              <p>{$date = this.getDateInformation(image.timestamp)}</p>

              <p>{image.clientUID}</p>
              <button className="button is-success">submit video</button>
            </form>
          <br />
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
