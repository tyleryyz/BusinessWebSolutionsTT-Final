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
      deleteUserData: null,
      changeSchoolData: null,
      addSchoolData: null
    };
    this.getAdminData = this.getAdminData.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddTutor = this.handleAddTutor.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.changePermission = this.changePermission.bind(this);
    this.removePermission = this.removePermission.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.cancelDelete = this.cancelDelete.bind(this);
    this.cancelPermissionChange = this.cancelPermissionChange.bind(this);
    this.getSchoolData = this.getSchoolData.bind(this);
    this.handleGetSchool = this.handleGetSchool.bind(this);
    this.handleAddSchool = this.handleAddSchool.bind(this);
    this.cancelAddSchool = this.cancelAddSchool.bind(this);
    this.addNewSchool = this.addNewSchool.bind(this);
    this.cancelChangeSchool = this.cancelChangeSchool.bind(this);
    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this);
  }

  getAdminData() {
    let uID = this.props.user.uid;
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

  getSchoolData(school) {
    return (fetch(`/api/schools?name=${school}`, {
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

  handleDelete(e) {
    e.preventDefault();
    const email = e.target.elements.email.value;
    let result = this.getUserData(email).then((user) => {
      this.setState({
        deleteUserData: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }

  handleGetSchool(e) {
    e.preventDefault();
    const school = e.target.elements.school.value;
    let result = this.getSchoolData(school).then((school) => {
      this.setState({
        changeSchoolData: school,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    });
  }

  handleAddTutor(e) {
    e.preventDefault();
    const email = e.target.elements.email.value;
    let result = this.getUserData(email).then((user) => {
      this.setState({
        changeUserData: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }

  handleAddSchool(e) {
    e.preventDefault();
    const school = e.target.elements.name.value;
    this.setState({
      addSchoolData: school,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  addNewSchool(e) {
    e.preventDefault();
    const course = e.target.elements.course.value;
    fetch(`/api/schools`, {
      method: 'POST',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({name: this.state.addSchoolData, course: course})
    }).then((user) => {
      this.setState({
        addSchoolData: null,
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

  removePermission(e) {
    e.preventDefault();
    const email = this.state.changeUserData.email;
    fetch(`/api/users?email=${email}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({permission: "Student"})
    }).then((user) => {
      this.setState({
        changeUserData: null,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }

  addCourse(e) {
    e.preventDefault();
    const school = this.state.changeSchoolData.name;
    const course = e.target.elements.course.value;
    if (course != ""){
      fetch(`/api/schools`, {
        method: 'PUT',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({name: school, course: course})
      }).then((user) => {
        this.setState({
          changeSchoolData: null,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        });
      })
    }
  }

  deleteUser(e) {
    e.preventDefault();
    const email = this.state.deleteUserData.email;
    fetch(`/api/users?email=${email}`, {method: 'DELETE'}).then((user) => {
      this.setState({
        deleteUserData: null,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }

  removeCourse(e) {
    e.preventDefault();
    const school = this.state.changeSchoolData.name;
    const course = document.getElementById("changeCourse").value;
    fetch(`/api/schools`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({name: school, course: course})
    }).then((user) => {
      this.setState({
        changeSchoolData: null,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }

  cancelDelete(e) {
    e.preventDefault();
    this.setState({
      deleteUserData: null,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  cancelPermissionChange(e) {
    e.preventDefault();
    this.setState({
      changeUserData: null,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  cancelAddSchool(e) {
    e.preventDefault();
    this.setState({
      addSchoolData: null,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  cancelChangeSchool(e) {
    e.preventDefault();
    this.setState({
      changeSchoolData: null,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  render() {
    let $data;
    let $deleteData;
    let $schoolData;
    let $addSchool;
    if (this.state.changeUserData) {
      $data = (
        <div className="container">
        <br />
        <div className="box">

        <form onSubmit={this.changePermission}>
          <p>Name: {this.state.changeUserData.fname}
            {this.state.changeUserData.lname}</p>
          <p>Email: {this.state.changeUserData.email}</p>
          <p>Permission: {this.state.changeUserData.permission}</p>
          <p>School: {this.state.changeUserData.school.name}</p>
          <p>Courses:</p>
          <ul>
          {this.state.changeUserData.courses.map((course, index) => (<li key={index}>{course}</li>))}
          </ul>

          <button className="button is-warning">
            Grant tutor permission
          </button>
          <button onClick={this.removePermission} className="button is-danger">
            Revoke tutor permission
          </button>
          <button onClick={this.cancelPermissionChange} className="button is-success">
            cancel
          </button>
        </form>
        </div>
      </div>)
    } else {
      $data = (<p></p>)
    }

    if (this.state.addSchoolData) {
      $addSchool = (
        <div className="container">
        <br/>
          <div className="box">
            <form onSubmit={this.addNewSchool}>
              <p>Add one course for {this.state.addSchoolData}</p>
              <div className="box">
                <div className="field">
                  <p className="control">
                    <input className="input" name="course" placeholder="Course Name"/>
                  </p>
                </div>
              </div>
              <button className="button is-success">
                Add school
              </button>
              <button onClick={this.cancelAddSchool} className="button is-success">
                cancel
              </button>
            </form>
          </div>
        </div>
      )
    } else {
      $addSchool = (<p></p>)
    }

    if (this.state.deleteUserData) {
      $deleteData = (<div className="container">
        <br/>
        <div className="box">
        <form onSubmit={this.deleteUser}>
          <p>Name: {this.state.deleteUserData.fname}
            {this.state.deleteUserData.lname}</p>
          <p>Email: {this.state.deleteUserData.email}</p>
          <p>Permission: {this.state.deleteUserData.permission}</p>
          <p>School: {this.state.changeUserData.school.name}</p>
          <p>Courses: </p>
          <ul>
          {this.state.changeUserData.courses.map((course, index) => (<li key={index}>{course}</li>))}
          </ul>
          <button className="button is-danger">
            Confirm user deletion
          </button>
          <button onClick={this.cancelDelete} className="button is-success">
            cancel
          </button>
        </form>
        </div>
      </div>)
    } else {
      $deleteData = (<p></p>)
    }
    if (this.state.changeSchoolData) {
      $schoolData = (
        <div className="container">
        <br/>
        <div className="box">
        <form onSubmit={this.addCourse}>
          <p>Name: {this.state.changeSchoolData.name}</p>
          <p>Courses:</p>
          <ul>
          {this.state.changeSchoolData.courses.map((course, index) => (<li key={index}>{course}</li>))}
          </ul>
          <br />
          <div className="box">
            <div className="field">
              <p className="control">
                <input className="input" id="changeCourse" name="course" placeholder="Course Name"/>
              </p>
            </div>
          </div>
          <button className="button is-success">
            Add class
          </button>
          <button onClick={(e) => this.removeCourse(e)} className="button is-danger">
            Remove Class
          </button>
          <button onClick={this.cancelChangeSchool} className="button is-success">
            cancel
          </button>
        </form>
        </div>
        <br />
      </div>)
    } else {
      $schoolData = (<p></p>)
    }

    if (this.state.adminUser && this.state.loaded) {
      if (this.state.adminUser.permission === "Admin") {
        return (<div>
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
          <br/>
          <form onSubmit={this.handleAddSchool}>
            <div className="container">
              <p>Add school</p>
              <div className="box">
                <div className="field">
                  <p className="control">
                    <input className="input" name="name" placeholder="School Name"/>
                  </p>
                </div>
              </div>
              <div className="field">
                <p className="control">
                  <button className="button is-outlined is-success">
                    Add school
                  </button>
                </p>
              </div>
            </div>
          </form>
          {$addSchool}
          <br/>
          <form onSubmit={this.handleGetSchool}>
            <div className="container">
              <p>Add/Remove Classes</p>
              <div className="box">
                <div className="field">
                  <p className="control">
                    <input className="input" name="school" placeholder="School Name"/>
                  </p>
                </div>
              </div>
              <div className="field">
                <p className="control">
                  <button className="button is-outlined is-success">
                    get school information
                  </button>
                </p>
              </div>
            </div>
          </form>
          {$schoolData}
        </div>);
      } else if (!(this.state.adminUser.permission === "Admin") && this.state.loaded) {
        return (<p>You don't have permission to access this</p>)
      } else {

        return (<p>Please wait</p>)
      }
    } else {
      return (<p>Please wait</p>)
    }
  }
}
export default Admin;
