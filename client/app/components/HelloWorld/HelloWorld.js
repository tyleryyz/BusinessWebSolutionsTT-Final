import React from 'react';
import {Link} from 'react-router-dom';

// This HelloWorld file is actually the Email Example.

const AWS = require('aws-sdk');

// Init variables for the SES object
var accessKey;
var secretAccess;
var regionArea;

fetchTextFile('http://localhost:8080/keys.txt', function(data){updateVars(data)});


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

// Create the emailer object
const ses = new AWS.SES();

// Init variables
var firstname;
var lastname;
var email;
var message;
var subject;

const HelloWorld = () => (
  <div>
	  <h1 className="title">Email Example</h1>
	  <form>
      <div className="container" id="container">
        <div className="box" id="box">
          <div className="field" id="fNameField">
            <label className="label">First Name</label>
            <div className="control" id="fNameControl">
              <input className="input" type="text" id="firstName" placeholder="First Name" required/>
            </div>
          </div>

          <div className="field">
            <label className="label">Last Name</label>
            <div className="control">
              <input className="input" type="text" id="lastName" placeholder="Last Name" required/>
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input className="input" type="email" id="email" placeholder="Email input" required/>
            </div>
          </div>

          <div className="field">
            <label className="label">Subject</label>
            <div className="control">
              <input className="input" type="text" id="subject" placeholder="Subject of Email" required/>
            </div>
          </div>

          <div className="field">
  			<label className="label">Message</label>
  				<div className="control">
    				<textarea className="textarea" id="message" placeholder="Enter your message!" required></textarea>
  				</div>
			</div>


          <div className="field">
            <div className="control">
              <label className="checkbox">
                <input type="checkbox" id="checkbox" required/>&nbsp; I agree to the
                <a href="#">
                  &nbsp;terms and conditions</a>
              </label>
            </div>
          </div>

          <div className="field is-grouped">
            <div className="control">
              <button className="button" id="submitButton" onClick={function(){
              	firstname = document.getElementById("firstName").value;
              	lastname = document.getElementById("lastName").value;
              	email = document.getElementById("email").value;
              	message = document.getElementById("message").value;
              	subject = document.getElementById("subject").value;
              	sendTheEmail();
              	}}>
              Submit</button>
            </div>
						<div id="cancelButton">
            <div className="control">
              <Link to="/">Cancel</Link>
							</div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
);

function sendTheEmail()
{
	// Params is basically what will be sent in the email when called
	// It currently pulls the information entered in the fields above


  const ses = new AWS.SES();



	const params = {
	  Destination: {
	    ToAddresses: [email]
	  },
	  Message: {
	    Body: {
	      Html: {
	        Charset: 'UTF-8',
	        Data:
	          '<strong>First Name:</strong> ' + firstname +
	          '<br><strong>Last Name:</strong> ' + lastname +
	          '<br><strong>Email to:</strong> ' + email +
	          '<br>Subject: '+ subject +
	          '<br>Message: ' + message
	      },
	      Text: {
	        Charset: 'UTF-8',
	        Data: 'First Name: ' + firstname + '\nLast Name: ' + lastname +
	          '\nEmail to: ' +email + '\nSubject: ' + subject + '\nMessage: ' + message
	      }
	    },
	    Subject: {
	      Charset: 'UTF-8',
	      Data: subject
	    }
	  },
	  ReturnPath: 'jjg297@nau.edu',
	  Source: 'jjg297@nau.edu'
	};

	ses.sendEmail(params, (err, data) => {
  		if (err) console.log(err, err.stack)
  		else console.log(data)
		}
	);
}

export default HelloWorld;
