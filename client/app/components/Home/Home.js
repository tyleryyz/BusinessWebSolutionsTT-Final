import React, { Component } from 'react';
import 'whatwg-fetch';

class Home extends Component {
  constructor(props) {
    super(props);
}

  renderClasses() {
      let classesBar = null;
      let classesList = [{calc:'Calculus'},{hist: 'History'} , {art: 'Drawing'}]
      if (classesList) {
          classesBar = <div>
                         <ul>
                           {classesList.map(function(class, index) {

                               return <li key={index}>
                                        {class}
                                      </li>

                                  }) }
                </ul>
              </div>
}
    return (
      <div>{classesBar}</div>
    )
  }

  render() {
		let $userName;
		let userObject = JSON.parse(localStorage.getItem('user'))
		console.log(userObject);
		if (userObject){
			console.log(userObject.fname)
			$userName = (<h1>Hello {userObject.fname} {userObject.lname}!</h1>)
		}

    return (
      <div>
			{$userName}

      </div>
    );
  }
}


export default Home;
