import React, {Component} from 'react';
import {Link} from 'react-router-dom';

class Dashboard extends Component {

  render() {
    return (<div><Link to="/Emailing">Send an Email!</Link><br />
    	<Link to="/ImageUpload">Upload some stuff</Link><br />
    	<Link to="/VideoPlayer">Watch some Videos!</Link><br /></div>);
  }
}

export default Dashboard;
