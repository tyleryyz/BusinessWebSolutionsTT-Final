import React, {Component} from 'react';
import 'whatwg-fetch';

import {NotificationContainer, NotificationManager} from 'react-notifications';
import '../../styles/bulma.css';

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var firebase = require('firebase');

// Init variables for the S3 object
var accessKey;
var secretAccess;
var regionArea;

// Init variables
var firstname;
var lastname;
var email;
var message;
var subject;

fetchTextFile('http://localhost:8080/keys.txt', function(data) {
  updateVars(data)
});

// This function is meant to call the server side files and will read
// from the keys.txt file
function fetchTextFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', path, false);
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var words = httpRequest.responseText.split('\n');
        accessKey = words[0];
        secretAccess = words[1];
        regionArea = words[2];
        callback(words);
      }
    }
  };
  httpRequest.send();
}

function updateVars(data) {
  accessKey = data[0];
  secretAccess = data[1];
  regionArea = data[2];
}

// Update the Access Keys
AWS.config.update({accessKeyId: accessKey.trim(), secretAccessKey: secretAccess.trim(), region: regionArea.trim()});

// Create an S3 client
var s3 = new AWS.S3();
//var ses = new AWS.SES();

// Create a bucket and upload something into it
//var bucketName = 'jjg297-' + uuid.v4();
var bucketName = 'tailored-tutoring'; //make a new bucket? container? Ask Jesus
var keyName = 'hello_world.txt';
let file;
var filename;

// function sendTheEmail()
// {
//
//   const ses = new AWS.SES();
//
//   const params = {
//     Destination: {
//       ToAddresses: [email]
//     },
//     Message: {
//       Body: {
//         Html: {
//           Charset: 'UTF-8',
//           Data:
//             '<strong>First Name:</strong> ' + firstname +
//             '<br><strong>Last Name:</strong> ' + lastname +
//             '<br><strong>Email to:</strong> ' + email +
//             '<br>Subject: '+ subject +
//             '<br>Message: ' + message
//         },
//         Text: {
//           Charset: 'UTF-8',
//           Data: 'First Name: ' + firstname + '\nLast Name: ' + lastname +
//             '\nEmail to: ' + email + '\nSubject: ' + subject + '\nMessage: ' + message
//         }
//       },
//       Subject: {
//         Charset: 'UTF-8',
//         Data: subject
//       }
//     },
//     ReturnPath: 'jjg297@nau.edu',
//     Source: 'jjg297@nau.edu'
//   };
//
//   ses.sendEmail(params, (err, data) => {
//       if (err) console.log(err, err.stack)
//       else console.log(data)
//     }
//   );
// }

class ProfileImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: '',
	  profileImage: null,
      user: null,
      loaded: false,
      courses: null
    };
    this.getData = this.getData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getData() {
    let uID = this.props.user.uid;
    console.log(uID)
    return (fetch(`/api/users?uID=${uID}`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  async getProfileImage(){
	  let uID = this.props.user.uid;
	  let url;
      console.log(uID)
      fetch(`/api/profileimages?clientUID=${uID}`, {
        headers: {
          "Content-Type": "Application/json"
        },
        method: 'GET'
	}).then(res => res.json()).then((res) => {
		console.log("RES: ", res);
		var params = {
			Bucket: bucketName,
			Key: res[0].imageURL
		};
		url = s3.getSignedUrl('getObject', params)
		console.log("IMAGE: ", res[0]);
		console.log("URL: ", url);
	}).then(() => {
		this.setState({
          imagePreviewUrl: url,
          loaded: false
        }, () => {
          this.setState({loaded: true})
  		})
	});
	return url;
  }

  componentWillMount() {
    let result = this.getData().then((user) => {
      console.log("will mount here", user)
      this.setState({
        user: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      })
  }).then(() => {
	  let image = this.getProfileImage();
	  if(image.imageURL)
	  {
		  this.setState({
			  profileImage: image,
			  loaded: false
		  }, () => {
			  this.setState({loaded: true})
		  });
	  }
	})
  }


  // When the Upload image button is clicked
  handleSubmit(e) {
    e.preventDefault();

    filename = this.state.file.name;
    var uploadName = this.props.user.uid;

    var extension = filename.split(".");
    if( extension.length === 1 || ( extension[0] === "" && extension.length === 2 ) ) {
        return "";
    }
    extension = extension.pop();    // feel free to tack .toLowerCase() here if you want
    uploadName = uploadName+'.'+extension;
    var keyName;
	extension = extension.toLowerCase();

    if(extension==="png" || extension==="jpg" || extension==="jpeg")
    {
        keyName = "ProfileImages/";
    }

    var params = {
      Bucket: bucketName,
      Key: keyName+uploadName,
      Body: file
    };

    let key = keyName+uploadName;
    s3.putObject(params, function(err, data) {
      if (err)
      {
        console.log(err)
      }
      else
      {
        console.log("Successfully uploaded data to " + bucketName + keyName + uploadName);
      }
    })

    let image = fetch(`/api/profileimages`, { //new place to store these?
      method: 'PUT',
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({
		  clientUID: this.state.user.uID,
		  imageURL: key})
    });

    console.log(image)
    console.log('Handling uploading, data presented: ', this.state.file);
    NotificationManager.success('Your image was successfully uploaded!', 'Success!'); //what does this do?
  }

  // This changes the 'Please select an Image for Preview'
  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({file: file, imagePreviewUrl: reader.result});
    }

    reader.readAsDataURL(file)
  }

  // Render the screen in HTML
  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = null;

    if (imagePreviewUrl) {
      $imagePreview = (<div className="imgPreview image"><img src={imagePreviewUrl}/></div>)
    } else {
      $imagePreview = (<div className="previewText">Please upload your profile image!
      (Acceptable formats: .jpg, .jpeg, .png)</div>);
    }
	console.log("Image preview: ", imagePreviewUrl);

    let $pageData;
    if (this.state.user){
    $pageData = (
      <div className="container">
      <div className="previewComponent">
      <form onSubmit={this.handleSubmit}>
        <div className="columns" height={250} width={250}>
			<div className="column is-one-third">
          {$imagePreview}
		  	</div>
			<div className="column is-one-third has-text-centered">
			<br/>
				<div className="previewText">Please upload your profile image!
		        (Acceptable formats: .jpg, .jpeg, .png)</div>
				<br/>
				<input className="fileInput" type="file" onChange={(e) => this._handleImageChange(e)}/>
				<br/><br/>
	        	<button className="button submitButton" type="submit">Upload Image</button>
			</div>
        </div>

      </form>
    </div>
  </div>)
  } else {$pageData = (<p>Please Wait</p>)}
    if (this.state.user){
    return (<div>
      {$pageData}
    </div>)
  } else {return (<p>Please Wait</p>)}
}
}

export default ProfileImage;
