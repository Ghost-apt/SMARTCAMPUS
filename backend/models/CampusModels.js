const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. USER SCHEMA & MODEL
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
      default: 'General'
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
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

// ==========================================
// 2. STUDENT PROFILE SCHEMA & MODEL
// ==========================================
const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      required: [true, 'Department is required (e.g. BCA, CSE, IT)'],
      trim: true,
      default: 'BCA'
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      default: 1
    },
    batch: {
      type: String,
      default: '2023-2026',
      trim: true
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    cgpa: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 10
    },
    attendancePercentage: {
      type: Number,
      default: 85.0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// 3. FACULTY PROFILE SCHEMA & MODEL
// ==========================================
const facultyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      default: 'Computer Applications'
    },
    designation: {
      type: String,
      default: 'Assistant Professor',
      trim: true
    },
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    officeRoom: {
      type: String,
      default: 'Faculty Block A - Room 204'
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// 4. COURSE SCHEMA & MODEL
// ==========================================
const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required (e.g. BCA-501)'],
      unique: true,
      uppercase: true,
      trim: true
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true
    },
    department: {
      type: String,
      required: true,
      default: 'BCA'
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },
    credits: {
      type: Number,
      default: 4,
      min: 1,
      max: 6
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: {
      type: String,
      default: ''
    },
    schedule: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        time: String,
        room: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// ==========================================
// 5. ATTENDANCE SCHEMA & MODEL
// ==========================================
const attendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      default: 'Present'
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to accelerate attendance queries and prevent duplicate entries per day
attendanceSchema.index({ course: 1, student: 1, date: 1 });

// ==========================================
// 6. ASSIGNMENT SCHEMA & MODEL
// ==========================================
const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    totalMarks: {
      type: Number,
      default: 100
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        submittedAt: {
          type: Date,
          default: Date.now
        },
        fileUrl: String,
        content: String,
        marksObtained: {
          type: Number,
          default: null
        },
        feedback: String,
        status: {
          type: String,
          enum: ['Submitted', 'Graded', 'Late'],
          default: 'Submitted'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// ==========================================
// 7. NOTICE / ANNOUNCEMENT SCHEMA & MODEL
// ==========================================
const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Notice content is required']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'student', 'faculty', 'admin'],
      default: 'all'
    },
    department: {
      type: String,
      default: 'All'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// 8. AI QUERY LOG SCHEMA & MODEL
// ==========================================
const aiQueryLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    query: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Academic', 'Campus_Info', 'Timetable', 'General', 'Technical'],
      default: 'General'
    },
    source: {
      type: String,
      enum: ['fastapi-ai', 'rule-fallback', 'mock'],
      default: 'fastapi-ai'
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// EXPORT MODELS
// ==========================================
const User = mongoose.model('User', userSchema);
const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
const FacultyProfile = mongoose.model('FacultyProfile', facultyProfileSchema);
const Course = mongoose.model('Course', courseSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Notice = mongoose.model('Notice', noticeSchema);
const AIQueryLog = mongoose.model('AIQueryLog', aiQueryLogSchema);

module.exports = {
  User,
  StudentProfile,
  FacultyProfile,
  Course,
  Attendance,
  Assignment,
  Notice,
  AIQueryLog
};
