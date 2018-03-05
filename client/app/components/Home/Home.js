import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link} from 'react-router-dom';

var firebase = require('firebase');

// Will render a profile image, user name, user class list, user school,
class Home extends Component {
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
    this.handleClaim = this.handleClaim.bind(this);
    this.filterImages = this.filterImages.bind(this);
    this.getDateInformation = this.getDateInformation.bind(this);

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
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }).then(() => {
      this.getImageData().then((images) => {
        images.sort(this.compare);
        this.setState({
          loaded: false,
          images: images
        }, () => {
          this.setState({loaded: true})
        })
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
      });
    });
  };

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
    return (fetch(`/api/images?status=${ "open"}`, {
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
      this.getImageData().then((images) => {
        this.setState({
          images: images,
          loaded: false
        }, () => {
          this.setState({loaded: true})

        });
      })

    })
  }

  filterImages(e) {
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
      });
    } else {
      console.log(course)
      return (fetch(`/api/images?course=${course}&status=${ "open"}`, {
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
      }));
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
    let dateInformation = (day + ' ' + monthNames[monthIndex] + ' ' + year)
    return (dateInformation)
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

  render() {

    if (this.state.user) {
      if (this.state.user.permission === "Tutor" && this.state.images && this.state.courses) {
        let $image;
        let $date;
        return (<div className="container">
          <p>tutor view</p>
          <Link to="/Claims">View claimed clients</Link><br />
          <p>sort by course tag</p>
          <div className="select">
            <select onChange={this.filterImages} value={this.state.filterVal} name="course">
              <option value="select">Select</option>
              {this.state.courses.map((course, index) => (<option key={index}>{course.name}</option>))}
            </select>
          </div>

          {
            this.state.images.map((image, index) => (
			<form onSubmit={(e) => this.handleClaim(e, image)} key={index}>
              <p>{$image = this.getImage(image.imageURL)}</p>
              <img src={"https://s3-us-west-2.amazonaws.com/tailored-tutoring/"+image.imageURL} width="256" height="256"/>
              <p>{image.clientUID}</p>
              <p>{$date = this.getDateInformation(image.timestamp)}</p>
              <button className="button is-success">claim</button>
              <br />
              <br />
            </form>))
          }

          <div id="editProfileButton">
            <div className="control">
              <Link to="/EditProfile">Edit Profile</Link>
            </div>
          </div>
        </div>)
      } else if (!(this.state.user.permission === "Tutor")) {
        return (<div>
          {console.log("here!", this.state.user)}
          {this.state.user.fname}
          <p>{this.state.user.school}</p>
          { //this.state.user.classList.map((subject, index) => (
            //<p key={index}>{subject}</p>
            //))
          }
          <div id="editProfileButton">
            <div className="control">
              <Link to="/EditProfile">Edit Profile</Link>
            </div>
          </div>
        </div>);
      } else {
        return null
      }
    } else {
      return (<div>
        {console.log("here")}
        <h1>Please wait</h1>
      </div>)
    }

  }
}

export default Home;
