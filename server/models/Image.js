const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  clientID: {
    type: String,
    unique: true
  },
  imageURL: {
    type: String
  },
  status: {
    type: String
  },
  tutorID: {
    type: String
  },
  course: {
    type: String
  }
});

module.exports = mongoose.model('Image', ImageSchema);
