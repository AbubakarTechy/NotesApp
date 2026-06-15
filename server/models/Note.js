const mongoose = require('mongoose');

// Define the Schema for Notes and Past Papers
const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'], // Semesters 1 to 8
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Notes', 'Past Papers'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    default: ''
  },
  localFilename: {
    type: String,
    default: ''
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedByEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Note', NoteSchema);
