import React, { Component } from 'react';
import 'whatwg-fetch';

class Home extends Component {
  constructor(props) {
    super(props);
}


  render() {
		let $userData;
		let userObject = JSON.parse(localStorage.getItem('user'))
		console.log(userObject);
		if (userObject){
			console.log(userObject.fname)
			$userData = (<h1>Hello {userObject.fname} {userObject.lname}!</h1>)
		}
    return (
      <div>
			{$userData}

      </div>
    );
  }
}


export default Home;
