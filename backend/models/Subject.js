const mongoose = require('mongoose');

// ==========================================
// SUBJECT SCHEMA & MODEL
// ==========================================
const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required (e.g. BCA-501)'],
      unique: true,
      uppercase: true,
      trim: true
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    courseCode: {
      type: String,
      required: true,
      default: 'BCA'
    },
    department: {
      type: String,
      required: true,
      default: 'Computer Applications'
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      default: 1
    },
    credits: {
      type: Number,
      default: 4,
      min: 1,
      max: 6
    },
    type: {
      type: String,
      enum: ['Theory', 'Practical', 'Elective'],
      default: 'Theory'
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: {
      type: String,
      default: ''
    },
    syllabus: {
      academicYear: {
        type: String,
        default: '2026-2027'
      },
      objectives: [
        {
          type: String,
          trim: true
        }
      ],
      units: [
        {
          unitNumber: {
            type: Number,
            required: true
          },
          title: {
            type: String,
            required: true,
            trim: true
          },
          teachingHours: {
            type: Number,
            default: 8
          },
          topics: [
            {
              type: String,
              trim: true
            }
          ],
          outcomes: [
            {
              type: String,
              trim: true
            }
          ]
        }
      ],
      textbooks: [
        {
          title: {
            type: String,
            trim: true
          },
          author: {
            type: String,
            trim: true
          },
          edition: {
            type: String,
            default: 'Latest Edition'
          },
          isPrescribed: {
            type: Boolean,
            default: true
          }
        }
      ],
      evaluationScheme: {
        internalWeightage: {
          type: Number,
          default: 30
        },
        endSemWeightage: {
          type: Number,
          default: 70
        },
        hasPractical: {
          type: Boolean,
          default: false
        }
      },
      syllabusFileUrl: {
        type: String,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

module.exports = Subject;
