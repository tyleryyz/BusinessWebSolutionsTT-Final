import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link} from 'react-router-dom';

var firebase = require('firebase');


  // Will render a profile image, user name, user class list, user school,
  class Dashboard extends Component {
    constructor(props) {
      super(props);
      this.state = {
        user: null,
        loaded: false,
        images: null
      };
      this.getData = this.getData.bind(this);
      this.getImageData = this.getImageData.bind(this);
    }

    getImageData() {
      return (fetch(`/api/images`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
      }).then(res => res.json()));
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
  render() {
    if (this.state.user && this.state.images && this.state.loaded) {
      return(
        <div>
        {this.state.images.map((image, index) => (
          <form key={index} onClick={this.handleClaim}>{image.clientID}</form>
        ))}
        </div>
      )
    }
    else if (this.state.user && this.state.loaded) {
      <p>No clients yet!</p>
    }
    else if (!this.state.loaded){
      <p>Please wait</p>
    }
  }
}

export default Dashboard;
