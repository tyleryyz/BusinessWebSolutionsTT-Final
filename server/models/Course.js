const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  }
});

//module.exports = mongoose.model('Course', CourseSchema);
