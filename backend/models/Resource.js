const mongoose = require('mongoose');

// ==========================================
// STUDY RESOURCES SCHEMA & MODEL
// ==========================================
const resourceSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    subjectCode: {
      type: String,
      default: 'BCA-501'
    },
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['Lecture Notes', 'Syllabus', 'Lab Manual', 'Question Bank', 'Reference Book'],
      default: 'Lecture Notes'
    },
    fileUrl: {
      type: String,
      default: 'https://smartcampus.edu/resources/sample-handout.pdf'
    },
    fileSize: {
      type: String,
      default: '2.4 MB'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    department: {
      type: String,
      default: 'BCA'
    },
    courseCode: {
      type: String,
      default: 'BCA'
    },
    semester: {
      type: Number,
      default: 5
    },
    ragStatus: {
      type: String,
      enum: ['Uploaded', 'Processing', 'Indexed', 'Failed'],
      default: 'Indexed'
    },
    chunkCount: {
      type: Number,
      default: 0
    },
    ragError: {
      type: String,
      default: ''
    },
    indexedAt: {
      type: Date,
      default: Date.now
    },
    extractedText: {
      type: String,
      default: ''
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.index({ subject: 1, ragStatus: 1 });
resourceSchema.index({ courseCode: 1, semester: 1, isPublished: 1 });

const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);

module.exports = Resource;
