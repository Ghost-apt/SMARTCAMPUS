const mongoose = require('mongoose');

// ==========================================
// REGISTRATION REQUEST SCHEMA & MODEL
// ==========================================
const registrationRequestSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: [true, 'Registration reference ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Applicant email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ],
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Password hash must never be leaked
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      default: 'Computer Applications'
    },
    course: {
      type: String,
      trim: true,
      default: 'BCA'
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1
    },
    academicYear: {
      type: String,
      trim: true,
      default: '2026-2027'
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'APPROVED', 'REJECTED'],
        message: '{VALUE} is not a valid registration status'
      },
      default: 'PENDING',
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED'],
      default: 'VERIFIED'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedStudentId: {
      type: String,
      trim: true,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedByName: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and filtering in administrator portal
registrationRequestSchema.index({ status: 1, createdAt: -1 });
registrationRequestSchema.index({ department: 1, status: 1 });

const RegistrationRequest =
  mongoose.models.RegistrationRequest ||
  mongoose.model('RegistrationRequest', registrationRequestSchema);

module.exports = RegistrationRequest;
