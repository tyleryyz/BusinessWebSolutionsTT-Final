const mongoose = require('mongoose');
const CourseSchema =  require('./Course.js');

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  courses: [CourseSchema],
  child: CourseSchema
});

module.exports = mongoose.model('School', SchoolSchema);
