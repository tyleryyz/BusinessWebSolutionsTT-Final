const mongoose = require('mongoose');

const ProfileImageSchema = new mongoose.Schema({
  clientUID: {
    type: String,
	unique: true
  },
  imageURL: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model('ProfileImage', ProfileImageSchema);
