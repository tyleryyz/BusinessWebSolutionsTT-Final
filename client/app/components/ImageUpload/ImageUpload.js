import React, { Component } from 'react';
import 'whatwg-fetch';

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

// Init variables for the S3 object
var accessKey;
var secretAccess;
var regionArea;

fetchTextFile('http://localhost:8080/keys.txt', function(data){updateVars(data)});

// This function is meant to call the server side files and will read
// from the keys.txt file
function fetchTextFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', path, false);
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var words = httpRequest.responseText.split('\n');
                accessKey=words[0];
                secretAccess=words[1];
                regionArea=words[2];
                callback(words);
            }
        }
    };
    httpRequest.send();
}

function updateVars(data)
{
  accessKey=data[0];
  secretAccess=data[1];
  regionArea=data[2];
}

// Update the Access Keys
AWS.config.update({
    accessKeyId: accessKey.trim(),
    secretAccessKey: secretAccess.trim(),
    region: regionArea.trim(),
});

// Create an S3 client
var s3 = new AWS.S3();


// Create a bucket and upload something into it
//var bucketName = 'jjg297-' + uuid.v4();
var bucketName = 'jjg297-my-first-bucket/Images';
var keyName = 'hello_world.txt';
let file;
var filename;

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {file: '',imagePreviewUrl: ''};
  }

  // When the Upload image button is clicked
  _handleSubmit(e) {
    filename = this.state.file.name;
    e.preventDefault();
    // TODO: do something with -> this.state.file
    var params = {
                  Bucket: bucketName,
                  Key: this.state.file.name,
                  Body: file
                };

    s3.putObject(params, function(err, data) {
    if (err)
      console.log(err)
    else
      console.log("Successfully uploaded data to " +
        bucketName + "/" + filename); window.location.reload();
  });

    console.log('Handling uploading, data presented: ', this.state.file);

  }

  // This changes the 'Please select an Image for Preview'
  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  // Render the screen in HTML
  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />);
    } else {
      $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }

		let $pageData;
		let userObject = JSON.parse(localStorage.getItem('user'))
		console.log(userObject);
		if (userObject){
			if (userObject.permission === "student"){
				$pageData = (
					<div className="previewComponent">
						<form onSubmit={(e)=>this._handleSubmit(e)}>
							<input className="fileInput"
								type="file"
								onChange={(e)=>this._handleImageChange(e)} />
							<button className="submitButton"
								type="submit"
								onClick={(e)=>this._handleSubmit(e)}>Upload Image</button>
						</form>
						<div className="imgPreview">
							{$imagePreview}
						</div>
					</div>
				)
			}
			else{
				$pageData = (<p>Tutors don't need to see this page, because reasons</p>)
			}
		}
		else{$pageData=(<h1>Log in to view page!</h1>)}

    return (
			<div>
			{$pageData}
			</div>
		)
  }
}

export default ImageUpload;
