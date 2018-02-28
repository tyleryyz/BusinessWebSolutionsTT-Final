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
      images: null
    };
    this.getData = this.getData.bind(this);
    this.getImageData = this.getImageData.bind(this);
    this.handleClaim = this.handleClaim.bind(this);
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
    })
    let imageData = this.getImageData().then((images)=>{
      this.setState({
        loaded: false,
        images: images
      }, () => {
        this.setState({loaded: true})
      })
  });
  };

  getImageData() {
    return (fetch(`/api/images?status=${"open"}`, {
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

  handleClaim(image){
    const imageURL = image.imageURL;
    fetch(`/api/images?imageURL=${imageURL}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({status: "Claimed", tutorID: this.state.user.uID})
    }).then((image) => {
      this.getImageData().then((images)=>{
      this.setState({
        images: images,
        loaded: false
      }, () => {
        this.setState({loaded: true})

      });
    })

  })
}

  render() {

    if (this.state.user) {
      if (this.state.user.permission === "Tutor" && this.state.images){
        let $image;
        return(
          <div className = "container">
          <p>tutor view</p>
          <Link to="/Claims">View claimed clients</Link>

          {this.state.images.map((image, index) => (

            <form key={index} onClick={this.handleClaim(image)}>
            {$image = this.getImage(image.imageURL)}
            {$image}
            {image.clientID}
            <button className = "button is-success">claim</button>
            </form>
          ))}
          </div>)
      } else if (!this.state.user.permission ==="Tutor") {
      return (<div>
        {console.log("here!", this.state.user)}
        {this.state.user.fname}
        <p>{this.state.user.school}</p>
        {//this.state.user.classList.map((subject, index) => (
          //<p key={index}>{subject}</p>
        //))
      }
      <div id="editProfileButton">
        <div className="control">
          <Link to="/EditProfile">Edit Profile</Link>
        </div>
      </div>
      </div>);
    } else {return null}
  } else {
      return (<div>
        {console.log("here")}
        <h1>Please wait</h1>
      </div>)
    }

  }
}

export default Home;
