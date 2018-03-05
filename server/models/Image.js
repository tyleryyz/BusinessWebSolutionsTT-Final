const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  clientUID: {
    type: String
  },
  imageURL: {
    type: String,
    unique: true
  },
  videoURL: {
    type: String,
    unique: true
  },
  status: {
    type: String
  },
  tutorUID: {
    type: String
  },
  course: {
    type: String
  },
  purchased: {
	type: Number
  },
  timestamp: {
    type: Number
  }
});

module.exports = mongoose.model('Image', ImageSchema);
