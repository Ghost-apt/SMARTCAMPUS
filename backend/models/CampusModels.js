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
      default: 'Computer Applications'
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
// 2. DEPARTMENT SCHEMA & MODEL
// ==========================================
const departmentSchema = new mongoose.Schema(
  {
    deptCode: {
      type: String,
      required: [true, 'Department code is required (e.g. CA, CSE)'],
      unique: true,
      trim: true,
      uppercase: true
    },
    deptName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactEmail: {
      type: String,
      default: ''
    },
    buildingLocation: {
      type: String,
      default: 'Academic Block A'
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// 3. COURSE / PROGRAM SCHEMA & MODEL
// ==========================================
const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required (e.g. BCA, MCA)'],
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
      default: 'Computer Applications'
    },
    durationYears: {
      type: Number,
      default: 3
    },
    totalSemesters: {
      type: Number,
      default: 6
    },
    credits: {
      type: Number,
      default: 120
    },
    description: {
      type: String,
      default: ''
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// 4. SUBJECT SCHEMA & MODEL
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
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// 5. STUDENT PROFILE SCHEMA & MODEL
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
      default: 'Computer Applications'
    },
    course: {
      type: String,
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
    enrolledSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
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
// 6. FACULTY PROFILE SCHEMA & MODEL
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
    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
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
// 7. ATTENDANCE SCHEMA & MODEL
// ==========================================
const attendanceSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
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
    semester: {
      type: Number,
      default: 5
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

// Unique compound index on subject, student, date to avoid duplicate entries
attendanceSchema.index({ subject: 1, student: 1, date: 1 });
attendanceSchema.index({ course: 1, student: 1, date: 1 });

// ==========================================
// 8. TIMETABLE SCHEMA & MODEL
// ==========================================
const timetableSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      default: 'BCA'
    },
    semester: {
      type: Number,
      required: true,
      default: 5
    },
    section: {
      type: String,
      default: 'A'
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    subjectCode: {
      type: String,
      default: ''
    },
    subjectName: {
      type: String,
      default: ''
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    facultyName: {
      type: String,
      default: ''
    },
    room: {
      type: String,
      required: true,
      default: 'Lab 304'
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    startTime: {
      type: String,
      required: true // e.g. "09:30"
    },
    endTime: {
      type: String,
      required: true // e.g. "11:00"
    }
  },
  {
    timestamps: true
  }
);

// Indexes to speed up conflict checking
timetableSchema.index({ faculty: 1, day: 1, startTime: 1 });
timetableSchema.index({ room: 1, day: 1, startTime: 1 });
timetableSchema.index({ courseCode: 1, semester: 1, section: 1, day: 1, startTime: 1 });

// ==========================================
// 9. ASSIGNMENT SCHEMA & MODEL
// ==========================================
const assignmentSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    courseCode: {
      type: String,
      default: 'BCA'
    },
    semester: {
      type: Number,
      default: 5
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
    status: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active'
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        studentName: String,
        studentRollNumber: String,
        submittedAt: {
          type: Date,
          default: Date.now
        },
        content: String,
        fileUrl: String,
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
// 10. EXAMINATION & RESULTS SCHEMAS & MODELS
// ==========================================
const examinationSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: [true, 'Examination name is required'],
      trim: true
    },
    courseCode: {
      type: String,
      default: 'BCA'
    },
    semester: {
      type: Number,
      required: true,
      default: 5
    },
    academicYear: {
      type: String,
      default: '2026-2027'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed'],
      default: 'Scheduled'
    }
  },
  {
    timestamps: true
  }
);

const resultSchema = new mongoose.Schema(
  {
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: true
    },
    examName: {
      type: String,
      default: 'Semester Examination'
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    subjectCode: {
      type: String,
      required: true
    },
    subjectName: {
      type: String,
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100
    },
    grade: {
      type: String,
      default: 'A'
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    evaluatedBy: {
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

resultSchema.index({ examination: 1, student: 1, subjectCode: 1 }, { unique: true });

// ==========================================
// 11. FEE RECORD SCHEMA & MODEL
// ==========================================
const feeRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    feeType: {
      type: String,
      required: true,
      enum: ['Tuition Fee', 'Examination Fee', 'Lab Fee', 'Library Fee', 'Hostel Fee', 'Other'],
      default: 'Tuition Fee'
    },
    semester: {
      type: Number,
      default: 5
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    balanceAmount: {
      type: Number,
      default: 0
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending', 'Overdue'],
      default: 'Pending'
    },
    receiptNumber: {
      type: String,
      default: ''
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

// Pre-save hook: compute balanceAmount & update status accordingly
feeRecordSchema.pre('save', async function () {
  this.balanceAmount = Math.max(0, this.totalAmount - (this.paidAmount || 0));
  if (this.balanceAmount === 0) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  } else {
    this.status = 'Pending';
  }
});

// ==========================================
// 12. NOTICE / ANNOUNCEMENT SCHEMA & MODEL
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
    category: {
      type: String,
      enum: ['Academic', 'Examination', 'Holiday', 'Event', 'General'],
      default: 'Academic'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// 13. STUDY RESOURCES SCHEMA & MODEL
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

// ==========================================
// 14. AI QUERY LOG SCHEMA & MODEL (Phase 3 Foundation)
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
// 16. ATTENDANCE SESSION (QR & CODE) SCHEMA & MODEL
// ==========================================
const attendanceSessionSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    courseCode: {
      type: String,
      default: 'BCA'
    },
    semester: {
      type: Number,
      default: 5
    },
    section: {
      type: String,
      default: 'A'
    },
    date: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Expired'],
      default: 'Active'
    },
    attendees: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        studentName: String,
        rollNumber: String,
        scannedAt: {
          type: Date,
          default: Date.now
        },
        method: {
          type: String,
          enum: ['QR', 'Code'],
          default: 'QR'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// ==========================================
// 17. NOTIFICATION SCHEMA & MODEL
// ==========================================
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'ASSIGNMENT_DEADLINE',
        'NEW_ASSIGNMENT',
        'ATTENDANCE_WARNING',
        'NOTICE',
        'RESULT_PUBLISHED',
        'FEE_DUE',
        'SYSTEM'
      ],
      default: 'SYSTEM'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ==========================================
// 18. AUDIT LOG SCHEMA & MODEL
// ==========================================
const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actorName: String,
    actorRole: String,
    action: {
      type: String,
      required: true
    },
    resourceType: String,
    resourceId: String,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
  },
  {
    timestamps: true
  }
);
auditLogSchema.index({ createdAt: -1 });

// ==========================================
// EXPORT ALL MODELS
// ==========================================
const User = mongoose.model('User', userSchema);
const Department = mongoose.model('Department', departmentSchema);
const Course = mongoose.model('Course', courseSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
const FacultyProfile = mongoose.model('FacultyProfile', facultyProfileSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const TimetableEntry = mongoose.model('TimetableEntry', timetableSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Examination = mongoose.model('Examination', examinationSchema);
const Result = mongoose.model('Result', resultSchema);
const FeeRecord = mongoose.model('FeeRecord', feeRecordSchema);
const Notice = mongoose.model('Notice', noticeSchema);
const Resource = mongoose.model('Resource', resourceSchema);
const AIQueryLog = mongoose.model('AIQueryLog', aiQueryLogSchema);
const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = {
  User,
  Department,
  Course,
  Subject,
  StudentProfile,
  FacultyProfile,
  Attendance,
  TimetableEntry,
  Assignment,
  Examination,
  Result,
  FeeRecord,
  Notice,
  Resource,
  AIQueryLog,
  AttendanceSession,
  Notification,
  AuditLog
};

