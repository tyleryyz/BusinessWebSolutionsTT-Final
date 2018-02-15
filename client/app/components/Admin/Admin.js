import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
import '../../styles/bulma.css';
var firebase = require('firebase');

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false
    };
    this.getData = this.getData.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleAddTutor = this.handleAddTutor.bind(this)
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

  handleDelete(e){
    e.preventDefault();
    const email = e.target.elements.email.value;
    var user = firebase.auth().currentUser;

    user.delete().then(function() {
      // User deleted.
    }).catch(function(error) {
      // An error happened.
    });



  }

  handleAddTutor(e){
    e.preventDefault();
    const email = e.target.elements.email.value;
    fetch(`/api/user?email=${email}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
    });

  }

  render() {
    if (this.state.user && this.state.loaded) {
      if (this.state.user.permission === "Admin") {
        return (
          <div>
          <p>Delete user</p>
          <form onSubmit={this.handleDelete}>
            <div className="container">
              <div className="box">
                <div className="field">
                  <p className="control">
                    <input className="input" name="email" type="email" placeholder="Email"/>
                  </p>
                </div>
              </div>
              <div className="field">
                <p className="control">
                  <button className="button is-success">
                    Delete user
                  </button>
                </p>
              </div>
            </div>

          </form>
          <p>Add tutor</p>
          <form onSubmit={this.handleAddTutor}>
            <div className="container">
              <div className="box">
                <div className="field">
                  <p className="control">
                    <input className="input" name="email" type="email" placeholder="Email"/>
                  </p>
                </div>
              </div>
              <div className="field">
                <p className="control">
                  <button className="button is-success">
                  Add tutor
                  </button>
                </p>
              </div>
            </div>

          </form>
          </div>);
      } else if (!(this.state.user.permission === "Admin") && this.state.loaded) {
        return (<p>You don't have permission to access this</p>)
      } else { console.log(this.state.user.permission)
        return(<p>Inner Please wait</p>)}
    } else {
      return (<p>Outer Please wait</p>)
    }
  }
}
export default Admin;
