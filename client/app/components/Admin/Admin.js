import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
import {NotificationContainer, NotificationManager} from 'react-notifications';

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
      addSchoolData: null,
      courseError: false,
      courseError2: false,
      schoolError: false,
      schoolError2: false,
      deleteError: false,
      tutorError: false,
      deleteSchoolData: false,
      viewUsers: false,
      viewSchools: false,
      allUsers: [],
      allSchools: []
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
    this.handleDeleteSchool = this.handleDeleteSchool.bind(this);
    this.deleteSchool = this.deleteSchool.bind(this);
    this.viewAdmin = this.viewAdmin.bind(this);
    this.viewUsers = this.viewUsers.bind(this);
    this.viewSchools = this.viewSchools.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getAllSchools = this.getAllSchools.bind(this);
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

  getAllUsers() {
    fetch(`/api/users`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()).then((users)=>{
      this.setState({
        allUsers: users,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })

  }

  getAllSchools() {
    fetch(`/api/schools`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()).then((schools)=>{
      this.setState({
        allSchools: schools,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
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
    if (!email){
      this.setState({
        deleteError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    } else {
    let result = this.getUserData(email).then((user) => {
      if (!user){
        NotificationManager.error('That email does not exist', 'Error');
      }
      this.setState({
        deleteUserData: user,
        deleteError: false,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }
  }

  handleGetSchool(e) {
    e.preventDefault();
    const school = e.target.elements.school.value;
    if (!school){
      this.setState({
        schoolError2: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    } else {
    let result = this.getSchoolData(school).then((school) => {
      if (!school){
        NotificationManager.error('That school does not exist', 'Error');
      }
      this.setState({
        changeSchoolData: school,
        schoolError2: false,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    });
  }
  }

  handleAddTutor(e) {
    e.preventDefault();
    const email = e.target.elements.email.value;
    if (!email){
      this.setState({
        tutorError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    } else {
    let result = this.getUserData(email).then((user) => {
      if(!user){
        NotificationManager.error('That email does not exist', 'Error');
      }
      this.setState({
        tutorError: false,
        changeUserData: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  }
  }

  handleDeleteSchool(e){
    this.setState({
      deleteSchoolData: true,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    });
  }

  deleteSchool(e){
    fetch(`/api/schools`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({name: this.state.changeSchoolData.name})
    }).then((school) => {
      this.setState({
        deleteSchoolData: false,
        changeSchoolData: null,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }).then(()=>{
      NotificationManager.success('New school was successfully deleted', 'School deleted');
    })
  }

  handleAddSchool(e) {
    e.preventDefault();
    const school = e.target.elements.name.value;
    if (!school){
      this.setState({
        schoolError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    } else {
    this.setState({
      addSchoolData: school,
      schoolError: false,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }
  }

  addNewSchool(e) {
    e.preventDefault();
    const course = e.target.elements.course.value;
    if (!course){
      this.setState({
        courseError: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    } else {
    fetch(`/api/schools`, {
      method: 'POST',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({name: this.state.addSchoolData, course: course})
    }).then((school) => {
      this.setState({
        courseError: false,
        addSchoolData: null,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }).then(()=>{
      NotificationManager.success('New school was successfully added', 'School added');
    })
  }
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
    }).then(()=>{
      NotificationManager.success('User was granted tutor permission', 'Permission granted');
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
    }).then(()=>{
      NotificationManager.success('Tutor permission removed', 'Permission removed');
    })
  }

  addCourse(e) {
    e.preventDefault();
    const school = this.state.changeSchoolData.name;
    const course = e.target.elements.course.value;
    if (course === ""){
      this.setState({
        courseError2: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }
    if (course != ""){
      fetch(`/api/schools`, {
        method: 'PUT',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({name: school, course: course})
      }).then((school) => {
        this.setState({
          courseError2: false,
          loaded: false
        }, () => {
          this.setState({loaded: true})
        });
      }).then(()=>{
        NotificationManager.success('Course successfully added', 'Course added');
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
    }).then(()=>{
      NotificationManager.success('User successfully deleted', 'User deleted');
    })
  }

  removeCourse(e) {
    e.preventDefault();
    const school = this.state.changeSchoolData.name;
    const course = document.getElementById("changeCourse").value;
    if (!course){
      this.setState({
        courseError2: true,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    } else {
    fetch(`/api/schools`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({name: school, course: course})
    }).then((school) => {
      console.log(school)
      this.setState({
        courseError2: false,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    }).then(()=>{
      NotificationManager.success('Course was successfully removed', 'Course removed');
    })

  }
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

  cancelDeleteSchool(e) {
    e.preventDefault();
    this.setState({
      deleteSchoolData: false,
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

  viewUsers(){
    this.setState({
      viewUsers: true,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  viewSchools(){
    this.setState({
      viewSchools: true,
      loaded: false
    }, () => {
      this.setState({loaded: true})
    })
  }

  viewAdmin(){
    this.setState({
      viewUsers: false,
      viewSchools: false,
      allUsers: [],
      allSchools: [],
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
    let $deleteSchool;

    if(this.state.viewUsers && this.state.adminUser.permission === "Admin"){
      this.getAllUsers();
      return(
        <div className="container">
        <div className="control">
        <a onClick={this.viewAdmin}>Back to admin page</a>
        </div>
        {this.state.allUsers.map((user, index) => (
          <div className = "box" key={index}>
          <p>Name: {user.fname} {user.lname}</p>
          <p>Email: {user.email}</p>
          <p>uid: {user.uID}</p>
          <p>Permission: {user.permission}</p>
          <p>School: {user.school.name}</p>
          <p>Courses:</p>
          <ul>
          {user.courses.map((course, index) => (<li key={index}>{course}</li>))}
          </ul>
          </div>
          ))}
        </div>

      )
    }

    if(this.state.viewSchools && this.state.adminUser.permission === "Admin"){
      this.getAllSchools();
      return(
        <div className="container">
        <div className="control">
        <a onClick={this.viewAdmin}>Back to admin page</a>
        </div>
        {this.state.allSchools.map((school, index) => (
          <div className = "box" key={index}>
          <p>Name: {school.name}</p>
          <p>Courses:</p>
          <ul>
          {school.courses.map((course, index) => (<li key={index}>{course}</li>))}
          </ul>
          </div>
          ))}

        </div>

      )
    }

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

    if(this.state.deleteSchoolData){
      $deleteSchool=(<div>
        <br />
        <p>Confirm school deletion</p>
      <button onClick={this.deleteSchool} className="button is-danger">
        Confirm deletion
      </button>
      <button onClick={this.cancelDeleteSchool} className="button is-success">
        cancel
      </button>
      </div>)
    } else {$deleteSchool=(<p></p>)}

    if (this.state.addSchoolData) {
      $addSchool = (
        <div>
        <br/>
        <div className="container">
          <div className="box">
            <form onSubmit={this.addNewSchool}>
              <p>Add one course for {this.state.addSchoolData}</p>
              <div className="box">
                <div className="field">
                {this.state.courseError?<p style = {{color: 'red'}}>Please enter a course name before continuing</p>:<p></p>}
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
          <p>School: {this.state.deleteUserData.school.name}</p>
          <p>Courses: </p>
          <ul>
          {this.state.deleteUserData.courses.map((course, index) => (<li key={index}>{course}</li>))}
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
        <div>
        <br />
        <div className="container">
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
            <p>Enter a course name</p>
            {this.state.courseError2?<p style = {{color: 'red'}}>Please enter a course name before continuing</p>:<p></p>}
              <p className="control">
                <input className="input" id="changeCourse" name="course" placeholder="Course Name"/>
              </p>
            </div>
          </div>
          <button className="button is-success">
            Add class
          </button>
          <button onClick={(e) => this.removeCourse(e)} className="button is-warning">
            Remove Class
          </button>
          <button onClick={(e) => this.handleDeleteSchool(e)} className="button is-danger">
            Delete School
          </button>
          <button onClick={this.cancelChangeSchool} className="button is-success">
            cancel
          </button>
        </form>
        {$deleteSchool}
        </div>
        <br />
      </div>
    </div>)
    } else {
      $schoolData = (<p></p>)
    }

    if (this.state.adminUser && this.state.loaded) {
      if (this.state.adminUser.permission === "Admin") {
        return (<div className="container">

          <div className="control">
          <a onClick={this.viewUsers}>View all users</a>
          </div>
          <div className="control">
          <a onClick={this.viewSchools}>View all schools</a>
          </div>

          <form onSubmit={this.handleDelete}>
            <div className="container">
              <p>Delete user</p>
              <div className="box">
                <div className="field">
                {this.state.deleteError?<p style = {{color: 'red'}}>Please enter a valid email before continuing</p>:<p></p>}
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
                {this.state.tutorError?<p style = {{color: 'red'}}>Please enter a valid email before continuing</p>:<p></p>}
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
                {this.state.schoolError?<p style = {{color: 'red'}}>Please enter a school name before continuing</p>:<p></p>}
                  <p className="control">
                    <input className="input" name="name" placeholder="School Name"/>
                  </p>
                </div>
              </div>
              <div className="field">
              <p className="control"><button className="button is-outlined is-success"> Add school</button></p>
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
                {this.state.schoolError2?<p style = {{color: 'red'}}>Please enter a school name before continuing</p>:<p></p>}
                  <p className="control">
                    <input className="input" name="school" placeholder="School Name"/>
                  </p>
                </div>
              </div>
              <div className="field">

                <p className="control">
                  <button className="button is-outlined is-success">
                    get school information
                  </button> </p>

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
