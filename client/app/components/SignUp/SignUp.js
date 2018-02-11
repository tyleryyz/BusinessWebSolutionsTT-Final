import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import { withRouter } from 'react-router';

import '../../styles/bulma.css';

class SignUp extends Component {

	constructor(props) {
    super(props);

		this.handleSignUp = this.handleSignUp.bind(this);

    this.routeTo = this.routeTo.bind(this);
  }

  toggleCheckbox(e) {
    if( document.getElementById(e.target.id).checked)
    {
      console.log("Checked!");
    }
    else {
      console.log("Unchecked!");
    }
  }

	handleSignUp(e){
		e.preventDefault();
		const email = e.target.elements.email.value;
		const password = e.target.elements.password.value;
		const fname = e.target.elements.fname.value;
		const lname = e.target.elements.lname.value;
		const permission = e.target.elements.permission.value;
    const school = e.target.elements.school.value;

    var classList = [];
    let existingClasses = ['class1', 'class2', 'class3'];

    for (var i = 0; i < existingClasses.length; i++){
      if( document.getElementById(existingClasses[i]).checked){
        classList.push(document.getElementById(existingClasses[i]).value);
      }
    }

		fetch('/api/users', {
													method: 'POST',
													headers: {"Content-Type": "Application/json"},
													body: JSON.stringify({
																									fname: fname,
																									lname: lname,
																									email: email,
																									password: password,
																									permission: permission,
                                                  school: school,
                                                  classList: classList
																							})}
			)
      .then(res => res.json())
      .then(json => {
				this.props.history.push('/LogIn');
      });
			this.routeTo()
	}

	routeTo() {
		<Link to="/" />

	}

  render() {
    return (<form onSubmit={this.handleSignUp}>
      <div className="container">
        <div className="box">
          <div className="field">
            <label className="label">First Name</label>
            <div className="control">
              <input className="input" name="fname" type="text" placeholder="First Name"/>
            </div>
          </div>
          <div className="field">
            <label className="label">Last Name</label>
            <div className="control">
              <input className="input" name="lname" type="text" placeholder="Last Name"/>
            </div>
          </div>
          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input className="input" name="email" type="email" placeholder="Email input"/>
            </div>
          </div>

          <div className="field">
            <label className="label">Password</label>
            <div className="control">
              <input className="input" name="password" type="text" placeholder="Password"/>
            </div>
          </div>

          <div className="field">
					<div className="control">
						<label className="radio">
							<input type="radio" value="student" name="permission"/>
							Student
						</label>
						<label className="radio">
							<input type="radio" value="tutor" name="permission"/>
							Tutor
						</label>
						</div>
          </div>

          <div className="field">
					  <div className="control">
						<label className="radio">
							<input type="radio" value="Northern Arizona University" name="school"/>
							Northern Arizona University
						</label>
						<label className="radio">
							<input type="radio" value="Arizona State University" name="school"/>
							Arizona State University
						</label>
						</div>
          </div>

          <div className="field">
            <div className="control">
              <label className="checkbox">
                <input type="checkbox" value="Calculus" name="class1" id='class1' onClick={this.toggleCheckbox} />
                Calculus
              </label>
              <label className="checkbox">
                <input type="checkbox" value="Biology" name="class2" id='class2' onClick={this.toggleCheckbox} />
                Biology
              </label>
              <label className="checkbox">
                <input type="checkbox" value="Physics" name="class3" id='class3' onClick={this.toggleCheckbox} />
                Physics
              </label>
            </div>
          </div>

          <div className="field is-grouped">
            <div className="control">
              <button className="button">Submit</button>
            </div>
						<div id="cancelButton">
            <div className="control">
              <Link to="/">Cancel</Link>
							</div>
            </div>
          </div>
        </div>
      </div>
    </form>);
  }
}

export default SignUp;
