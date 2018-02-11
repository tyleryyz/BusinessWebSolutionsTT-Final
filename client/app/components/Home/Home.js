import React, { Component } from 'react';
import 'whatwg-fetch';

// Will render a profile image, user name, user class list, user school,
class Home extends Component {
  constructor(props) {
    super(props);
  }

  render() {
		let $userName;
    let $userSchool;
    let $classes = [];
		let userObject = JSON.parse(localStorage.getItem('user'))
		console.log(userObject);
		if (userObject){
			console.log(userObject.fname)
			$userName = (<h1>Hello {userObject.fname} {userObject.lname}!</h1>)
      $userSchool = ( <h3>{userObject.school}</h3> )
      $classes = userObject.classList;
		}

    return (
      <div>
			{$userName}
      {$userSchool}
      {$classes.map((person, index) => (
        <p key={index}>{person}</p>
      ))}
      </div>
    );
  }
}


export default Home;
