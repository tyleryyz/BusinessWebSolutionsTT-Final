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
  type: String
  },
  classList: {
    type: Array
  },
  permission: {
    type: String

});

module.exports = mongoose.model('User', UserSchema);
