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
  }

});

module.exports = mongoose.model('User', UserSchema);
