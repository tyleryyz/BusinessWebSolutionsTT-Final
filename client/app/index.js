import React from 'react';
import { render } from 'react-dom';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom'

import App from './components/App/App';
import NotFound from './components/App/NotFound';

import Home from './components/Home/Home';

import Emailing from './components/Emailing/Emailing';

import Login from './components/Login/Login';
import Signup from './components/Login/SignUp';
import ImageUpload from './components/ImageUpload/ImageUpload';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';

import './styles/styles.scss';

render((
  <Router>
    <App>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/emailexample" component={Emailing}/>
        <Route path="/signup" component={Signup}/>
        <Route path="/login" component={Login}/>
        <Route path="/imageupload" component={ImageUpload}/>
        <Route path="/videoplayer" component={VideoPlayer}/>
        <Route component={NotFound}/>
      </Switch>
    </App>
  </Router>
), document.getElementById('app'));
