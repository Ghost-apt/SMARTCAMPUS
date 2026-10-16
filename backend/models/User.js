const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Canonical default profile avatar across university roles
const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

// ==========================================
// USER SCHEMA & MODEL
// ==========================================
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Excluded by default in queries for security
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'faculty', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'student'
    },
    studentId: {
      type: String,
      trim: true,
      default: ''
    },
    facultyId: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: 'Computer Applications'
    },
    avatar: {
      type: String,
      default: DEFAULT_AVATAR_URL
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Hash password with bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password for authentication
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
User.DEFAULT_AVATAR_URL = DEFAULT_AVATAR_URL;

module.exports = User;
module.exports.DEFAULT_AVATAR_URL = DEFAULT_AVATAR_URL;
