import React, {Component} from 'react';
import { render } from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom'

import NotFound from './NotFound';

import Home from '../Home/Home';

import HelloWorld from '../HelloWorld/HelloWorld';

import Login from '../Login/Login';
import Signup from '../SignUp/SignUp';
import ImageUpload from '../ImageUpload/ImageUpload';

import '../../styles/styles.scss';
var firebase = require('firebase');


class App extends Component {
	constructor(props){

		super(props);
		console.log(this.props);
		this.children = this.props.children;
	}

	render(){

		return(
			<div>
      	<Switch>
	        <Route exact path="/" render={()=>
						<Home/>}/>
					<Route exact path="/helloworld" render={()=>
						<HelloWorld/>}/>
					<Route exact path="/imageupload" render={()=>
						<ImageUpload/>}/>
		      </Switch>
			</div>
			)
	}
}
export default App;
