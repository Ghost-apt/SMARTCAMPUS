require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { closeDB } = require('../config/database');
const {
  User,
  StudentProfile,
  FacultyProfile,
  Department,
  Course,
  Subject,
  TimetableEntry,
  Attendance,
  Assignment,
  Examination,
  Result,
  FeeRecord,
  Notice,
  Resource,
  AttendanceSession,
  Notification
} = require('../models/CampusModels');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcampus';

const seedDemoUsers = async () => {
  console.log('🌱 Starting SmartCampus AI Phase 2 Comprehensive Seeding...');
  console.log(`📡 Target MongoDB: ${MONGODB_URI}`);

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    }
    console.log('✅ Connected to MongoDB.');

    const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'Admin@123';
    const facultyPassword = process.env.DEMO_FACULTY_PASSWORD || 'Faculty@123';
    const studentPassword = process.env.DEMO_STUDENT_PASSWORD || 'Student@123';

    // 1. Users (Ensure demo accounts are present and passwords are encrypted and valid)
    let admin = await User.findOne({ email: 'admin@smartcampus.edu' }).select('+password');
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
      admin.password = adminPassword;
      admin.accountStatus = 'active';
      await admin.save();
      console.log('👤 Verified Admin demo credentials: admin@smartcampus.edu');
    }

    let faculty = await User.findOne({ email: 'faculty@smartcampus.edu' }).select('+password');
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
      faculty.password = facultyPassword;
      faculty.accountStatus = 'active';
      await faculty.save();
      console.log('👤 Verified Faculty demo credentials: faculty@smartcampus.edu');
    }

    let student = await User.findOne({ email: 'student@smartcampus.edu' }).select('+password');
    if (!student) {
      student = await User.create({
        name: 'Anurag Singh',
        email: 'student@smartcampus.edu',
        password: studentPassword,
        role: 'student',
        department: 'Computer Applications',
        studentId: 'BCA-2023-042',
        phone: '+91 8318057287',
        accountStatus: 'active'
      });
      console.log('👤 Created Student: student@smartcampus.edu');
    } else {
      student.password = studentPassword;
      student.accountStatus = 'active';
      await student.save();
      console.log('👤 Verified Student demo credentials: student@smartcampus.edu');
    }

    // Fix any other existing users in the database missing passwords
    const usersNeedingPassword = await User.find({
      $or: [{ password: { $exists: false } }, { password: null }, { password: '' }]
    }).select('+password');

    for (const u of usersNeedingPassword) {
      const pwd = u.role === 'admin' ? adminPassword : (u.role === 'faculty' ? facultyPassword : studentPassword);
      u.password = pwd;
      u.accountStatus = 'active';
      await u.save();
      console.log(`🔑 Restored password for user account: ${u.email}`);
    }

    // 2. Departments
    let deptCA = await Department.findOne({ deptCode: 'CA' });
    if (!deptCA) {
      deptCA = await Department.create({
        deptCode: 'CA',
        deptName: 'Department of Computer Applications',
        description: 'Undergraduate and postgraduate computing programs (BCA, MCA)',
        headOfDepartment: faculty._id,
        contactEmail: 'ca.hod@smartcampus.edu',
        buildingLocation: 'Academic Wing B - Level 3'
      });
      console.log('🏛️ Created Department: CA');
    }

    let deptCSE = await Department.findOne({ deptCode: 'CSE' });
    if (!deptCSE) {
      deptCSE = await Department.create({
        deptCode: 'CSE',
        deptName: 'Department of Computer Science & Engineering',
        description: 'Engineering programs specializing in Systems, AI, and Networks',
        headOfDepartment: faculty._id,
        contactEmail: 'cse.hod@smartcampus.edu',
        buildingLocation: 'Engineering Block - Level 2'
      });
      console.log('🏛️ Created Department: CSE');
    }

    // 3. Programs (Courses)
    let courseBCA = await Course.findOne({ courseCode: 'BCA' });
    if (!courseBCA) {
      courseBCA = await Course.create({
        courseCode: 'BCA',
        courseName: 'Bachelor of Computer Applications',
        department: 'Computer Applications',
        durationYears: 3,
        totalSemesters: 6,
        credits: 140,
        description: 'Undergraduate degree emphasizing software development, AI, databases, and web systems.',
        faculty: faculty._id
      });
      console.log('🎓 Created Program: BCA');
    }

    let courseMCA = await Course.findOne({ courseCode: 'MCA' });
    if (!courseMCA) {
      courseMCA = await Course.create({
        courseCode: 'MCA',
        courseName: 'Master of Computer Applications',
        department: 'Computer Applications',
        durationYears: 2,
        totalSemesters: 4,
        credits: 90,
        description: 'Postgraduate program covering distributed systems, machine intelligence, and cloud architecture.',
        faculty: faculty._id
      });
      console.log('🎓 Created Program: MCA');
    }

    // 4. Subjects for BCA Semester 5
    const subjectDefs = [
      {
        subjectCode: 'BCA-501',
        subjectName: 'Artificial Intelligence & Machine Learning',
        courseCode: 'BCA',
        department: 'Computer Applications',
        semester: 5,
        credits: 4,
        type: 'Theory',
        faculty: faculty._id,
        description: 'Agent architectures, neural networks, supervised learning, and LLM prompting.'
      },
      {
        subjectCode: 'BCA-502',
        subjectName: 'Full-Stack Web Engineering',
        courseCode: 'BCA',
        department: 'Computer Applications',
        semester: 5,
        credits: 4,
        type: 'Theory',
        faculty: faculty._id,
        description: 'MERN stack engineering, REST architectures, JWT security, and state management.'
      },
      {
        subjectCode: 'BCA-503',
        subjectName: 'Cloud Computing & DevOps',
        courseCode: 'BCA',
        department: 'Computer Applications',
        semester: 5,
        credits: 3,
        type: 'Practical',
        faculty: faculty._id,
        description: 'Containerization, CI/CD pipelines, AWS/GCP cloud services, and Docker.'
      },
      {
        subjectCode: 'BCA-504',
        subjectName: 'Cybersecurity & Cryptography',
        courseCode: 'BCA',
        department: 'Computer Applications',
        semester: 5,
        credits: 3,
        type: 'Theory',
        faculty: faculty._id,
        description: 'Symmetric & asymmetric encryption, network intrusion prevention, and ethical hacking.'
      }
    ];

    const subjects = [];
    for (const def of subjectDefs) {
      let sub = await Subject.findOne({ subjectCode: def.subjectCode });
      if (!sub) {
        sub = await Subject.create(def);
        console.log(`📚 Created Subject: ${def.subjectCode} - ${def.subjectName}`);
      }
      subjects.push(sub);
    }

    // 5. Update Profiles
    await FacultyProfile.findOneAndUpdate(
      { user: faculty._id },
      {
        user: faculty._id,
        employeeId: 'FAC-BCA-001',
        department: 'Computer Applications',
        designation: 'Associate Professor',
        assignedCourses: [courseBCA._id, courseMCA._id],
        assignedSubjects: subjects.map((s) => s._id),
        officeRoom: 'Faculty Block A - Room 204'
      },
      { upsert: true, returnDocument: 'after' }
    );

    await StudentProfile.findOneAndUpdate(
      { user: student._id },
      {
        user: student._id,
        rollNumber: 'BCA-2023-042',
        department: 'Computer Applications',
        course: 'BCA',
        semester: 5,
        batch: '2023-2026',
        cgpa: 8.75,
        attendancePercentage: 92.0,
        enrolledCourses: [courseBCA._id],
        enrolledSubjects: subjects.map((s) => s._id)
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 6. Timetable Schedule (No conflicts)
    const timetableCount = await TimetableEntry.countDocuments();
    if (timetableCount === 0) {
      await TimetableEntry.create([
        {
          courseCode: 'BCA',
          semester: 5,
          section: 'A',
          subject: subjects[0]._id,
          subjectCode: 'BCA-501',
          subjectName: 'Artificial Intelligence & ML',
          faculty: faculty._id,
          facultyName: 'Dr. Sarah Sharma',
          room: 'Lab 304',
          day: 'Monday',
          startTime: '09:30',
          endTime: '11:00'
        },
        {
          courseCode: 'BCA',
          semester: 5,
          section: 'A',
          subject: subjects[1]._id,
          subjectCode: 'BCA-502',
          subjectName: 'Full-Stack Web Engineering',
          faculty: faculty._id,
          facultyName: 'Dr. Sarah Sharma',
          room: 'Hall B',
          day: 'Monday',
          startTime: '11:30',
          endTime: '13:00'
        },
        {
          courseCode: 'BCA',
          semester: 5,
          section: 'A',
          subject: subjects[2]._id,
          subjectCode: 'BCA-503',
          subjectName: 'Cloud Computing & DevOps',
          faculty: faculty._id,
          facultyName: 'Dr. Sarah Sharma',
          room: 'Lab 302',
          day: 'Tuesday',
          startTime: '09:30',
          endTime: '11:00'
        },
        {
          courseCode: 'BCA',
          semester: 5,
          section: 'A',
          subject: subjects[3]._id,
          subjectCode: 'BCA-504',
          subjectName: 'Cybersecurity & Cryptography',
          faculty: faculty._id,
          facultyName: 'Dr. Sarah Sharma',
          room: 'Room 204',
          day: 'Wednesday',
          startTime: '10:00',
          endTime: '11:30'
        },
        {
          courseCode: 'BCA',
          semester: 5,
          section: 'A',
          subject: subjects[0]._id,
          subjectCode: 'BCA-501',
          subjectName: 'Artificial Intelligence & ML',
          faculty: faculty._id,
          facultyName: 'Dr. Sarah Sharma',
          room: 'Lab 304',
          day: 'Thursday',
          startTime: '09:30',
          endTime: '11:00'
        },
        {
          courseCode: 'BCA',
          semester: 5,
          section: 'A',
          subject: subjects[1]._id,
          subjectCode: 'BCA-502',
          subjectName: 'Full-Stack Web Engineering',
          faculty: faculty._id,
          facultyName: 'Dr. Sarah Sharma',
          room: 'Hall B',
          day: 'Friday',
          startTime: '11:30',
          endTime: '13:00'
        }
      ]);
      console.log('🗓️ Seeded conflict-free weekly timetable.');
    }

    // 7. Attendance Records (10 sessions, 9 present = 90% attendance)
    const attCount = await Attendance.countDocuments({ student: student._id });
    if (attCount === 0) {
      const dates = [
        new Date('2026-10-01'),
        new Date('2026-10-02'),
        new Date('2026-10-03'),
        new Date('2026-10-06'),
        new Date('2026-10-07'),
        new Date('2026-10-08'),
        new Date('2026-10-09'),
        new Date('2026-10-12'),
        new Date('2026-10-13'),
        new Date('2026-10-14')
      ];

      for (let i = 0; i < dates.length; i++) {
        const sub = subjects[i % subjects.length];
        await Attendance.create({
          subject: sub._id,
          student: student._id,
          date: dates[i],
          status: i === 4 ? 'Absent' : 'Present',
          semester: 5,
          markedBy: faculty._id,
          remarks: i === 4 ? 'Medical leave requested' : 'Regular'
        });
      }
      console.log('📋 Seeded historical attendance logs.');
    }

    // 8. Assignments
    let assignment1 = await Assignment.findOne({ title: 'AI Neural Network Architectures' });
    if (!assignment1) {
      assignment1 = await Assignment.create({
        title: 'AI Neural Network Architectures',
        description: 'Implement a Multi-Layer Perceptron (MLP) from scratch and document forward & backpropagation mathematics.',
        subject: subjects[0]._id,
        courseCode: 'BCA',
        semester: 5,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days ahead
        totalMarks: 50,
        createdBy: faculty._id,
        status: 'Active',
        submissions: []
      });
      console.log('📝 Created Assignment: AI Neural Network Architectures');
    }

    let assignment2 = await Assignment.findOne({ title: 'Full-Stack JWT Authentication Project' });
    if (!assignment2) {
      assignment2 = await Assignment.create({
        title: 'Full-Stack JWT Authentication Project',
        description: 'Build a secure registration and login pipeline with password hashing and Role-Based Access Control.',
        subject: subjects[1]._id,
        courseCode: 'BCA',
        semester: 5,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        totalMarks: 100,
        createdBy: faculty._id,
        status: 'Active',
        submissions: [
          {
            student: student._id,
            studentName: student.name,
            studentRollNumber: 'BCA-2023-042',
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            content: 'Implemented with Express, bcryptjs, signed JWT tokens, and React AuthContext guards. Full repo tested.',
            fileUrl: 'https://smartcampus.edu/submissions/bca-502-anurag.zip',
            marksObtained: 94,
            feedback: 'Excellent implementation of security headers, salted hashing, and protected route handlers.',
            status: 'Graded'
          }
        ]
      });
      console.log('📝 Created Assignment: Full-Stack JWT Authentication Project (with graded submission)');
    }

    // 9. Examinations & Results
    let exam = await Examination.findOne({ examName: 'Mid-Semester Examinations 2026' });
    if (!exam) {
      exam = await Examination.create({
        examName: 'Mid-Semester Examinations 2026',
        courseCode: 'BCA',
        semester: 5,
        academicYear: '2026-2027',
        startDate: new Date('2026-11-10'),
        endDate: new Date('2026-11-20'),
        status: 'Scheduled'
      });
      console.log('📑 Created Examination: Mid-Semester Examinations 2026');
    }

    const resCount = await Result.countDocuments({ student: student._id });
    if (resCount === 0) {
      await Result.create([
        {
          examination: exam._id,
          examName: exam.examName,
          student: student._id,
          subject: subjects[0]._id,
          subjectCode: 'BCA-501',
          subjectName: 'Artificial Intelligence & Machine Learning',
          marksObtained: 88,
          maxMarks: 100,
          grade: 'A',
          status: 'Pass',
          evaluatedBy: faculty._id,
          remarks: 'Strong conceptual grasp of machine intelligence and optimization.'
        },
        {
          examination: exam._id,
          examName: exam.examName,
          student: student._id,
          subject: subjects[1]._id,
          subjectCode: 'BCA-502',
          subjectName: 'Full-Stack Web Engineering',
          marksObtained: 93,
          maxMarks: 100,
          grade: 'A+',
          status: 'Pass',
          evaluatedBy: faculty._id,
          remarks: 'Outstanding project demonstration and code structure.'
        }
      ]);
      console.log('🏆 Seeded student examination results.');
    }

    // 10. Fee Records
    const feeCount = await FeeRecord.countDocuments({ student: student._id });
    if (feeCount === 0) {
      await FeeRecord.create([
        {
          student: student._id,
          feeType: 'Tuition Fee',
          semester: 5,
          totalAmount: 45000,
          paidAmount: 45000,
          balanceAmount: 0,
          dueDate: new Date('2026-08-30'),
          status: 'Paid',
          receiptNumber: 'RCP-2026-0892',
          remarks: 'Full semester fee paid online.'
        },
        {
          student: student._id,
          feeType: 'Examination Fee',
          semester: 5,
          totalAmount: 2500,
          paidAmount: 1500,
          balanceAmount: 1000,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days ahead
          status: 'Partial',
          receiptNumber: 'RCP-2026-1142',
          remarks: 'Installment 1 paid. Balance due before hall ticket generation.'
        }
      ]);
      console.log('💳 Seeded student fee records.');
    }

    // 11. Study Resources
    const resourceCount = await Resource.countDocuments();
    if (resourceCount === 0) {
      await Resource.create([
        {
          subject: subjects[0]._id,
          subjectCode: 'BCA-501',
          title: 'Introduction to Artificial Intelligence & Search Trees',
          description: 'Comprehensive slides covering DFS, BFS, A* search, and heuristic evaluations.',
          category: 'Lecture Notes',
          fileUrl: 'https://smartcampus.edu/resources/bca501-unit1.pdf',
          fileSize: '3.8 MB',
          uploadedBy: faculty._id
        },
        {
          subject: subjects[1]._id,
          subjectCode: 'BCA-502',
          title: 'Full-Stack Architecture & Modern REST Best Practices',
          description: 'Official course handout covering layered architectures, input validation, and JWT authentication.',
          category: 'Reference Book',
          fileUrl: 'https://smartcampus.edu/resources/bca502-handbook.pdf',
          fileSize: '5.2 MB',
          uploadedBy: faculty._id
        },
        {
          subject: subjects[2]._id,
          subjectCode: 'BCA-503',
          title: 'DevOps & Docker Containerization Lab Manual',
          description: 'Hands-on laboratory manual with Dockerfile syntax, multi-stage builds, and deployment instructions.',
          category: 'Lab Manual',
          fileUrl: 'https://smartcampus.edu/resources/bca503-lab-manual.pdf',
          fileSize: '2.1 MB',
          uploadedBy: faculty._id
        }
      ]);
      console.log('📂 Seeded academic study resources.');
    }

    // 12. Notices
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.create([
        {
          title: 'SmartCampus AI Phase 2: Core Campus Management Active',
          content: 'The university portal now features full attendance management, conflict-free timetables, exam results, and fee tracking.',
          author: admin._id,
          targetAudience: 'all',
          priority: 'Urgent',
          department: 'All',
          category: 'Academic'
        },
        {
          title: 'BCA Final-Year Capstone Project Review-1',
          content: 'All BCA final-year project teams must submit their Phase 1 software architecture diagrams and documentation.',
          author: faculty._id,
          targetAudience: 'student',
          priority: 'High',
          department: 'Computer Applications',
          category: 'Academic'
        }
      ]);
      console.log('📢 Seeded initial campus notices.');
    }

    // 13. Active QR Attendance Session (Phase 3)
    const sessionCount = await AttendanceSession.countDocuments();
    if (sessionCount === 0) {
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // Active for 2 hours
      await AttendanceSession.create({
        sessionCode: 'BCA501',
        qrToken: 'token-demo-session-bca-501-active',
        subject: subjects[0]._id,
        faculty: faculty._id,
        courseCode: 'BCA',
        semester: 5,
        section: 'A',
        date: new Date(),
        expiresAt,
        status: 'Active',
        attendees: []
      });
      console.log('📱 Seeded active QR attendance session (Code: BCA501).');
    }

    // 14. Notifications (Phase 3)
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.create([
        {
          recipient: student._id,
          type: 'ASSIGNMENT_DEADLINE',
          title: 'Assignment Deadline Approaching',
          message: 'Your assignment "AI Neural Network Architectures" is due in 5 days. Submit your solution before the portal closes.',
          link: '/student/assignments',
          isRead: false
        },
        {
          recipient: student._id,
          type: 'NOTICE',
          title: 'New Campus Circular Published',
          message: 'BCA Final-Year Capstone Project Review-1 has been scheduled. Check requirements.',
          link: '/student/notices',
          isRead: false
        },
        {
          recipient: student._id,
          type: 'FEE_DUE',
          title: 'Semester Fee Installment Reminder',
          message: 'Examination Fee installment of ₹1,000 is due within 14 days.',
          link: '/student/fees',
          isRead: false
        },
        {
          recipient: faculty._id,
          type: 'NEW_ASSIGNMENT',
          title: 'Pending Submissions for Review',
          message: 'Students have submitted deliverables for "Full-Stack JWT Authentication Project".',
          link: '/faculty/assignments',
          isRead: false
        },
        {
          recipient: admin._id,
          type: 'SYSTEM',
          title: 'System Health Check Passed',
          message: 'All backend microservices, MongoDB collections, and scheduler tasks are online.',
          link: '/admin/analytics',
          isRead: false
        }
      ]);
      console.log('🔔 Seeded role-based notifications.');
    }

    console.log(`
==================================================
✅ SmartCampus AI Phase 1, 2, and 3 Seeding Complete!
==================================================
Verified Demo Accounts:
1. Student: student@smartcampus.edu / ${studentPassword}
2. Faculty: faculty@smartcampus.edu / ${facultyPassword}
3. Admin:   admin@smartcampus.edu   / ${adminPassword}
==================================================
    `);

    if (require.main === module) {
      await closeDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seeding Error:', err.message);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDemoUsers();
}

module.exports = seedDemoUsers;
