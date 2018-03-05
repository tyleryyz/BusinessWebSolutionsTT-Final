import React, {Component} from 'react';
import 'whatwg-fetch';

var uuid = require('node-uuid');
var firebase = require('firebase');

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false
    };
  }

  render() {

    let $pageData;
    $pageData = (<div></div>)

    return (<div>
      {$pageData}
    </div>)
  }
}

export default Calendar;