import React, {Component} from 'react';
import 'whatwg-fetch';
import {Link, Route, Switch, Router} from 'react-router-dom';
const testimage = require("../../../public/assets/img/poster.png")
const profImage = require("../../../public/assets/img/profile.png")

var firebase = require('firebase');

// Will render a profile image, user name, user class list, user school,
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false
    };
    this.getData = this.getData.bind(this);
	this.handleFilter = this.handleFilter.bind(this);
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

  handleFilter(subject, e) {
	  e.preventDefault();
	  this.props.filter(subject);
  }

  render() {

    if (this.state.user && this.state.loaded) {

      return (
        <div>
        <section className="headerSection">
          <div style={{ textAlign: "center"}} className="block">
            {/*<img src={testimage} />*/}
            <h1 className="title">Tailored Tutoring Co.</h1>
            {/*<h2 className="subtitle">roblokken@tailoredtutoringco.com</h2>*/}
          </div>
        </section>

        <div className="block">
          <section className="hero is-light">
            <div className="hero-body">

                <div className="columns">
                  <div className="column is-3">
					<figure className="image is-128x128">
  						<img src={profImage} />
					</figure>
					<h2 style= {{fontSize: "22px" }} className="subtitle">
                    {this.state.user.fname}{" "}{this.state.user.lname}</h2>
                  </div>


                  <div className="column is-8">
				  <br></br>

                    <p className="heading">{this.state.user.school.name}</p>
                    {this.state.user.courses.map((subject, index) => (
                    <p key={index}>{subject}</p>
                    ))}

				</div>
				<div className="column">

                    <button className="button">
                      <Link to="/EditProfile">Edit Profile</Link>
                    </button>

                  </div>
                </div> {/* close columns */}

            </div>
          </section>
        </div>

        <div className="block">
          <section className="subjectSection">
              <div className="container">
                <h1 className="title">My Subjects</h1>
                <h2 className="subtitle">
                  <div className="columns">
                  {/* My For-Loop essentially */}
                    {this.state.user.courses.map((subject, index) => (
                        <div key={index} className="column is-3">

						  <button className="button is-text-dark" onClick={(e) => this.handleFilter(subject, e)}>
						  	<Link to='/Dashboard'>{subject}</Link>
						  </button>

						  <p><button className="button">
                            <Link to="">Submit Assignment</Link>
                          </button></p>
                          <p><button className="button">
                            <Link to="">View Past Submissions</Link>
                          </button></p>
                        </div>
                    ))}
                  </div>
                </h2>
              </div> {/* close container, adds a margin */}
          </section>
        </div>
      </div> //close container


      )
    } else {
      return (<div>
        <h1>Please wait</h1>
      </div>)
    }

  }
}
// <div id="editProfileButton">
// <div className="control">
//   <Link to="/EditProfile">Edit Profile</Link>
// </div>
// <p>{this.state.user.fname}</p>
// <p>{this.state.user.school.name}</p>
// <ul>
// {this.state.user.courses.map((course, index) => (<li key={index}>{course}</li>))}
// </ul>

export default Home;
