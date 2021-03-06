const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fname: {
    type: String
  },
  lname: {
    type: String
  },
  email: {
    type: String,
    unique: true
  },
  uID: {
    type: String,
    unique: true
  },
  school: {
    type: Object
  },
  courses: [String],

  permission: {
    type: String
  },
  imageURL: {
	  type: String
  }
});

module.exports = mongoose.model('User', UserSchema);
