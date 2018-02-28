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
      images: null
    };
    this.getData = this.getData.bind(this);
    this.getImageData = this.getImageData.bind(this);
    this.submitVideo = this.submitVideo.bind(this);
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
    }).then(()=>{
    let imageData = this.getImageData().then((images) => {
      this.setState({
        loaded: false,
        images: images
      }, () => {
        this.setState({loaded: true})
      })
    });
  });
  };

  getImageData() {
    console.log("here", this.state.uID)
    return (fetch(`/api/images?tutorID=${this.state.user.uID}`, {
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

  submitVideo() {}

  render() {

    if (this.state.user && this.state.loaded) {
      if (this.state.user.permission === "Tutor" && this.state.images) {
        let $image;
        return (<div className="container">
          <p>tutor view</p>
          <Link to="/Dashboard">Back to dashboard</Link>

          {
            this.state.images.map((image, index) => (<form key={index} onClick={this.submitVideo(image)}>
              {$image = this.getImage(image.imageURL)}
              {$image}
              {image.clientID}
              <button className="button is-success">submit video</button>
            </form>))
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
