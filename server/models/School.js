const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  courses: [String]
});

module.exports = mongoose.model('School', SchoolSchema);
