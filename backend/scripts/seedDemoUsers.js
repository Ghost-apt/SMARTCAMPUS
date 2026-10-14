require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const {
  User,
  StudentProfile,
  FacultyProfile,
  Course,
  Notice
} = require('../models/CampusModels');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcampus';

const seedDemoUsers = async () => {
  console.log('🌱 Starting SmartCampus AI Demo User Seeding...');
  console.log(`📡 Target MongoDB: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    // Passwords from environment or secure defaults for local development
    const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'Admin@123';
    const facultyPassword = process.env.DEMO_FACULTY_PASSWORD || 'Faculty@123';
    const studentPassword = process.env.DEMO_STUDENT_PASSWORD || 'Student@123';

    // 1. Upsert Admin User
    let admin = await User.findOne({ email: 'admin@smartcampus.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@smartcampus.edu',
        password: adminPassword,
        role: 'admin',
        department: 'Administration',
        phone: '+91 9876543210',
        accountStatus: 'active'
      });
      console.log('👤 Created Admin: admin@smartcampus.edu');
    } else {
      console.log('ℹ️ Admin already exists: admin@smartcampus.edu');
    }

    // 2. Upsert Faculty User
    let faculty = await User.findOne({ email: 'faculty@smartcampus.edu' });
    if (!faculty) {
      faculty = await User.create({
        name: 'Dr. Sarah Sharma',
        email: 'faculty@smartcampus.edu',
        password: facultyPassword,
        role: 'faculty',
        department: 'Computer Applications',
        facultyId: 'FAC-BCA-001',
        phone: '+91 9876543211',
        accountStatus: 'active'
      });
      console.log('👤 Created Faculty: faculty@smartcampus.edu');
    } else {
      console.log('ℹ️ Faculty already exists: faculty@smartcampus.edu');
    }

    // 3. Upsert Student User
    let student = await User.findOne({ email: 'student@smartcampus.edu' });
    if (!student) {
      student = await User.create({
        name: 'Rahul Verma',
        email: 'student@smartcampus.edu',
        password: studentPassword,
        role: 'student',
        department: 'BCA',
        studentId: 'BCA-2023-042',
        phone: '+91 9876543212',
        accountStatus: 'active'
      });
      console.log('👤 Created Student: student@smartcampus.edu');
    } else {
      console.log('ℹ️ Student already exists: student@smartcampus.edu');
    }

    // 4. Upsert Sample Courses
    let course1 = await Course.findOne({ courseCode: 'BCA-501' });
    if (!course1) {
      course1 = await Course.create({
        courseCode: 'BCA-501',
        courseName: 'Artificial Intelligence & Machine Learning',
        department: 'BCA',
        semester: 5,
        credits: 4,
        faculty: faculty._id,
        description: 'Foundations of intelligent agents, neural models, NLP, and applied AI systems.'
      });
      console.log('📚 Created Course: BCA-501');
    }

    let course2 = await Course.findOne({ courseCode: 'BCA-502' });
    if (!course2) {
      course2 = await Course.create({
        courseCode: 'BCA-502',
        courseName: 'Full-Stack Web Engineering',
        department: 'BCA',
        semester: 5,
        credits: 4,
        faculty: faculty._id,
        description: 'Modern full-stack web architectures with React, Node.js, Express, and MongoDB.'
      });
      console.log('📚 Created Course: BCA-502');
    }

    // 5. Upsert Profiles
    await FacultyProfile.findOneAndUpdate(
      { user: faculty._id },
      {
        user: faculty._id,
        employeeId: 'FAC-BCA-001',
        department: 'Computer Applications',
        designation: 'Associate Professor',
        assignedCourses: [course1._id, course2._id]
      },
      { upsert: true, returnDocument: 'after' }
    );

    await StudentProfile.findOneAndUpdate(
      { user: student._id },
      {
        user: student._id,
        rollNumber: 'BCA-2023-042',
        department: 'BCA',
        semester: 5,
        batch: '2023-2026',
        cgpa: 8.75,
        attendancePercentage: 91.5,
        enrolledCourses: [course1._id, course2._id]
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 6. Upsert Notices
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.create([
        {
          title: 'SmartCampus AI Portal Launch',
          content: 'Welcome to the SmartCampus AI university portal. Access real-time attendance, grades, and 24/7 AI academic support.',
          author: admin._id,
          targetAudience: 'all',
          priority: 'Urgent',
          department: 'All'
        },
        {
          title: 'BCA Final-Year Capstone Project Review',
          content: 'All BCA final-year project teams must submit their Phase 1 software architecture and documentation by this Friday.',
          author: faculty._id,
          targetAudience: 'student',
          priority: 'High',
          department: 'BCA'
        }
      ]);
      console.log('📢 Seeded initial campus notices.');
    }

    console.log(`
==================================================
✅ Demo Seeding Completed Successfully!
==================================================
Demo Credentials for Testing:
1. Admin:   admin@smartcampus.edu   / ${adminPassword}
2. Faculty: faculty@smartcampus.edu / ${facultyPassword}
3. Student: student@smartcampus.edu / ${studentPassword}
==================================================
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDemoUsers();
}

module.exports = seedDemoUsers;

