import React, { Component } from 'react';
import 'whatwg-fetch';
import { Player } from 'video-react';
import "../../../../node_modules/video-react/dist/video-react.css"; // import css

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

const VideoPlayer = () => ( 

    <Player
      playsInline
      poster="/assets/img/poster.png"
      src="https://s3-us-west-1.amazonaws.com/jjg297-my-first-bucket/Images/small.mp4"
    />
);

export default VideoPlayer;
