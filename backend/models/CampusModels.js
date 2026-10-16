/**
 * SmartCampus AI — Central Models Aggregator
 * 
 * Re-exports all 18 domain models and canonical constants from individual model files
 * for complete backwards compatibility across existing controllers, services, and scripts.
 */

const User = require('./User');
const Department = require('./Department');
const Course = require('./Course');
const Subject = require('./Subject');
const StudentProfile = require('./StudentProfile');
const FacultyProfile = require('./FacultyProfile');
const Attendance = require('./Attendance');
const TimetableEntry = require('./TimetableEntry');
const Assignment = require('./Assignment');
const Examination = require('./Examination');
const Result = require('./Result');
const FeeRecord = require('./FeeRecord');
const Notice = require('./Notice');
const Resource = require('./Resource');
const AIQueryLog = require('./AIQueryLog');
const AttendanceSession = require('./AttendanceSession');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// Canonical default profile avatar across university roles
const DEFAULT_AVATAR_URL = User.DEFAULT_AVATAR_URL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

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
  AuditLog,
  DEFAULT_AVATAR_URL
};
