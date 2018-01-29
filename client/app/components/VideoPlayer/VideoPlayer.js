import React, { Component } from 'react';
import 'whatwg-fetch';
import { Player, BigPlayButton } from 'video-react';
import "../../../../node_modules/video-react/dist/video-react.css"; // import css

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

const VideoPlayer = () => ( 

<div id="choices">
    <Player playsInline
      fluid={false}
      poster="/assets/img/poster.png"
      src="https://s3-us-west-1.amazonaws.com/jjg297-my-first-bucket/Images/small.mp4"
      width={480}
      height={300}
    ><BigPlayButton position="center" /></Player>
    <Player playsInline
      fluid={false}
      src="http://clips.vorwaerts-gmbh.de/VfE_html5.mp4"
      width={480}
      height={300}
    ><BigPlayButton position="center" /></Player>
    <Player playsInline
      fluid={false}
      poster="https://s3-us-west-1.amazonaws.com/jjg297-my-first-bucket/Images/poster2.PNG"
      src="https://s3-us-west-1.amazonaws.com/jjg297-my-first-bucket/Videos/SampleVideo_1280x720_1mb.mp4"
      width={480}
      height={300}
    ><BigPlayButton position="center" /></Player>
</div>
);

export default VideoPlayer;
