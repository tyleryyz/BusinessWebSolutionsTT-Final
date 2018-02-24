import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
import '../../styles/bulma.css';
var firebase = require('firebase');

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adminUser: null,
      loaded: false,
      changeUserData: null,
      deleteUserData: null
    };
    this.getAdminData = this.getAdminData.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddTutor = this.handleAddTutor.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.changePermission = this.changePermission.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.cancelDelete = this.cancelDelete.bind(this);
    this.cancelPermissionChange = this.cancelPermissionChange.bind(this);
  }

  getAdminData() {
    let uID = this.props.user.uid;
    console.log(uID)
    return (fetch(`/api/users?uID=${uID}`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  getUserData(email) {
    return (fetch(`/api/users?email=${email}`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  componentWillMount() {
    let result = this.getAdminData().then((user) => {
      this.setState({
        adminUser: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  };

  handleDelete(e){
    e.preventDefault();
    const email = e.target.elements.email.value;
    let result = this.getUserData(email).then((user) => {
      console.log("will mount here", user)
      this.setState({
        deleteUserData: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })



  }

  handleAddTutor(e){
    e.preventDefault();
    const email = e.target.elements.email.value;
    let result = this.getUserData(email).then((user) => {
      console.log("will mount here", user)
      this.setState({
        changeUserData: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }

  changePermission(e) {
    e.preventDefault();
    const email = this.state.changeUserData.email;
    fetch(`/api/users?email=${email}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({permission: "Tutor"})
    }).then((user) => {
      this.setState({
        changeUserData: null,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }

  deleteUser(e) {
    e.preventDefault();
    const email = this.state.deleteUserData.email;
    fetch(`/api/users?email=${email}`, {
      method: 'DELETE'
    }).then((user)=> {
      this.setState({
        deleteUserData: null,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }

  cancelDelete(e){
    e.preventDefault();
    this.setState({
      deleteUserData: null,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  cancelPermissionChange(e){
    e.preventDefault();
    this.setState({
      changeUserData: null,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  render() {
    let $data;
    let $deleteData;
    if (this.state.changeUserData){
       $data = (
        <div className="container">
        <br/>
        <form onSubmit={this.changePermission}>
          <p>Name: {this.state.changeUserData.fname} {this.state.changeUserData.lname}</p>
          <p>Email: {this.state.changeUserData.email}</p>
          <p>Permission: {this.state.changeUserData.permission}</p>
          <button className="button is-warning">
            Confirm permission change
          </button>
          <button onClick={this.cancelPermissionChange} className="button is-success">
            cancel
          </button>
          </form>
        </div>
      )
    } else {$data = (<p></p>) }

    if (this.state.deleteUserData){
       $deleteData = (
        <div className="container">
        <br/>
        <form onSubmit={this.deleteUser}>
          <p>Name: {this.state.deleteUserData.fname} {this.state.deleteUserData.lname}</p>
          <p>Email: {this.state.deleteUserData.email}</p>
          <p>Permission: {this.state.deleteUserData.permission}</p>
          <button className="button is-danger">
            Confirm user deletion
          </button>
          <button onClick={this.cancelDelete} className="button is-success">
            cancel
          </button>
          </form>
        </div>
      )
    } else {$deleteData = (<p></p>) }

    if (this.state.adminUser && this.state.loaded) {
      if (this.state.adminUser.permission === "Admin") {
        return (
          <div>
          <form onSubmit={this.handleDelete}>
            <div className="container">
            <p>Delete user</p>
              <div className="box">
                <div className="field">
                  <p className="control">
                    <input className="input" name="email" type="email" placeholder="Email"/>
                  </p>
                </div>
              </div>
              <div className="field">
                <p className="control">
                  <button className="button is-outlined is-danger">
                    Delete user
                  </button>
                </p>
              </div>
            </div>
          </form>
          {$deleteData}
          <br/>
          <form onSubmit={this.handleAddTutor}>
            <div className="container">
            <p>Add tutor</p>
              <div className="box">
                <div className="field">
                  <p className="control">
                    <input className="input" name="email" type="email" placeholder="Email"/>
                  </p>
                </div>
              </div>
              <div className="field">
                <p className="control">
                  <button className="button is-outlined is-success">
                  Change permission
                  </button>
                </p>
              </div>
            </div>
          </form>
          {$data}
          </div>);
      }
      else if (!(this.state.adminUser.permission === "Admin") && this.state.loaded) {
        return (<p>You don't have permission to access this</p>)
      } else { console.log(this.state.adminUser.permission)
        return(<p>Inner Please wait</p>)}
    } else {
      return (<p>Outer Please wait</p>)
    }
  }
}
export default Admin;
