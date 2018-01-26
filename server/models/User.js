const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	fname: {
    type: String
  },
	lname: {
    type: String
  },
	email: {
    type: String
  },
	password: {
    type: String
  },
	permission: {
    type: String
  }

});

module.exports = mongoose.model('User', UserSchema);
