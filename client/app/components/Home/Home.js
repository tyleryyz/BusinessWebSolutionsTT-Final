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
      loaded: false
    };
    this.getData = this.getData.bind(this)
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
  };

  render() {

    if (this.state.user) {
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

    } else {
      return (<div>
        {console.log("here")}
        <h1>Please wait</h1>
      </div>)
    }

  }
}

export default Home;
