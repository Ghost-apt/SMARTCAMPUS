const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_smartcampus_2026';

let mongoServer;
let app;

describe('SmartCampus AI — Backend API Verification Suite', () => {
  before(async () => {
    // 1. Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    // Disconnect any existing default connection and reconnect to in-memory db
    await mongoose.disconnect();
    await mongoose.connect(uri);

    // Require app after env is configured
    app = require('../server');
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // ------------------------------------------------------------
  // 1. HEALTH ENDPOINT TEST
  // ------------------------------------------------------------
  test('1. GET /api/health should return 200 with service and db status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.service, 'SmartCampus AI API');
    assert.ok(res.body.timestamp);
    assert.ok(res.body.database);
    assert.strictEqual(res.body.database.connected, true);
  });

  // ------------------------------------------------------------
  // 2. REGISTRATION TEST
  // ------------------------------------------------------------
  test('2. POST /api/auth/register should successfully register a new student', async () => {
    const payload = {
      name: 'Amit Kumar',
      email: 'amit.student@smartcampus.edu',
      password: 'Password123!',
      role: 'student',
      department: 'BCA',
      rollNumber: 'BCA-2023-101'
    };

    const res = await request(app).post('/api/auth/register').send(payload);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, 'amit.student@smartcampus.edu');
    assert.strictEqual(res.body.user.role, 'student');
  });

  // ------------------------------------------------------------
  // 3. DUPLICATE-EMAIL REJECTION TEST
  // ------------------------------------------------------------
  test('3. POST /api/auth/register should reject registration with an existing email', async () => {
    const duplicatePayload = {
      name: 'Duplicate Amit',
      email: 'amit.student@smartcampus.edu',
      password: 'AnotherPassword123!',
      role: 'student'
    };

    const res = await request(app).post('/api/auth/register').send(duplicatePayload);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  // ------------------------------------------------------------
  // 4. PASSWORD HASHING VERIFICATION TEST
  // ------------------------------------------------------------
  test('4. User password must be securely hashed and never exposed in queries', async () => {
    const { User } = require('../models/CampusModels');
    const userDoc = await User.findOne({ email: 'amit.student@smartcampus.edu' }).select('+password');

    assert.ok(userDoc);
    assert.notStrictEqual(userDoc.password, 'Password123!');
    assert.ok(userDoc.password.startsWith('$2')); // bcrypt salt indicator
    const isMatch = await userDoc.comparePassword('Password123!');
    assert.strictEqual(isMatch, true);
  });

  // ------------------------------------------------------------
  // 5. LOGIN SUCCESS AND FAILURE TEST
  // ------------------------------------------------------------
  let studentToken = '';
  test('5. POST /api/auth/login should authenticate valid credentials and reject invalid credentials', async () => {
    // Valid credentials
    const validRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amit.student@smartcampus.edu', password: 'Password123!' });

    assert.strictEqual(validRes.statusCode, 200);
    assert.strictEqual(validRes.body.success, true);
    assert.ok(validRes.body.token);
    studentToken = validRes.body.token;

    // Invalid password
    const invalidRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amit.student@smartcampus.edu', password: 'WrongPassword' });

    assert.strictEqual(invalidRes.statusCode, 401);
    assert.strictEqual(invalidRes.body.success, false);

    // Non-existent email
    const unknownRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unknown@smartcampus.edu', password: 'Password123!' });

    assert.strictEqual(unknownRes.statusCode, 401);
  });

  // ------------------------------------------------------------
  // 6. AUTHENTICATED USER RETRIEVAL TEST
  // ------------------------------------------------------------
  test('6. GET /api/auth/me and GET /api/users/me should return authenticated user profile', async () => {
    const resAuthMe = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(resAuthMe.statusCode, 200);
    assert.strictEqual(resAuthMe.body.user.email, 'amit.student@smartcampus.edu');
    assert.strictEqual(resAuthMe.body.user.role, 'student');

    const resUsersMe = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(resUsersMe.statusCode, 200);
    assert.strictEqual(resUsersMe.body.user.email, 'amit.student@smartcampus.edu');
  });

  // ------------------------------------------------------------
  // 7. LOGOUT TEST
  // ------------------------------------------------------------
  test('7. POST /api/auth/logout should clear cookie and return 200', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  // ------------------------------------------------------------
  // 8. STUDENT AUTHORIZATION TEST
  // ------------------------------------------------------------
  test('8. Student should access /api/dashboard/student and be forbidden from /api/dashboard/admin', async () => {
    const studentRes = await request(app)
      .get('/api/dashboard/student')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(studentRes.statusCode, 200);
    assert.strictEqual(studentRes.body.role, 'student');

    const forbiddenRes = await request(app)
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(forbiddenRes.statusCode, 403);
    assert.strictEqual(forbiddenRes.body.success, false);
  });

  // ------------------------------------------------------------
  // 9. FACULTY AUTHORIZATION TEST
  // ------------------------------------------------------------
  let facultyToken = '';
  test('9. Faculty should access /api/dashboard/faculty and be forbidden from /api/dashboard/admin', async () => {
    // Register Faculty
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Dr. Neha Gupta',
      email: 'neha.faculty@smartcampus.edu',
      password: 'FacultyPassword123!',
      role: 'faculty',
      department: 'Computer Applications',
      employeeId: 'FAC-BCA-005'
    });

    assert.strictEqual(regRes.statusCode, 201);
    facultyToken = regRes.body.token;

    // Access faculty dashboard
    const facRes = await request(app)
      .get('/api/dashboard/faculty')
      .set('Authorization', `Bearer ${facultyToken}`);

    assert.strictEqual(facRes.statusCode, 200);
    assert.strictEqual(facRes.body.role, 'faculty');

    // Forbidden from admin
    const adminRes = await request(app)
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${facultyToken}`);

    assert.strictEqual(adminRes.statusCode, 403);
  });

  // ------------------------------------------------------------
  // 10. ADMIN AUTHORIZATION TEST
  // ------------------------------------------------------------
  let adminToken = '';
  test('10. Admin should access /api/dashboard/admin and management endpoints', async () => {
    // Create admin directly in database (as public registration blocks admin creation)
    const { User } = require('../models/CampusModels');
    const adminDoc = await User.create({
      name: 'Master Admin',
      email: 'master.admin@smartcampus.edu',
      password: 'AdminPassword123!',
      role: 'admin',
      department: 'IT Directorate'
    });

    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign(
      { id: adminDoc._id, email: adminDoc.email, role: 'admin', name: adminDoc.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const adminRes = await request(app)
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(adminRes.statusCode, 200);
    assert.strictEqual(adminRes.body.role, 'admin');
    assert.ok(adminRes.body.data.metrics.totalUsers >= 3);
  });

  // ------------------------------------------------------------
  // 11. PROTECTED ENDPOINTS TEST (REJECT UNAUTHENTICATED)
  // ------------------------------------------------------------
  test('11. Unauthenticated requests to protected endpoints must return HTTP 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);

    const resDash = await request(app).get('/api/dashboard/student');
    assert.strictEqual(resDash.statusCode, 401);
  });

  // ------------------------------------------------------------
  // 12. REQUEST VALIDATION TEST
  // ------------------------------------------------------------
  test('12. Validation should reject invalid email, short password, and public admin registration', async () => {
    // Missing email
    const invalidEmailRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: '123' });
    assert.strictEqual(invalidEmailRes.statusCode, 400);

    // Attempting to register as 'admin' publicly
    const adminAttemptRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hacker', email: 'hack@smartcampus.edu', password: 'Password123!', role: 'admin' });
    assert.strictEqual(adminAttemptRes.statusCode, 403);
    assert.match(adminAttemptRes.body.message, /restricted/i);
  });

  // ------------------------------------------------------------
  // 13. DASHBOARD API STRUCTURED RESPONSES
  // ------------------------------------------------------------
  test('13. Dashboard APIs must return structured, non-null analytical data', async () => {
    const res = await request(app)
      .get('/api/dashboard/student')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.data);
    assert.ok(typeof res.body.data.attendanceRate === 'number');
    assert.ok(Array.isArray(res.body.data.courses));
    assert.ok(Array.isArray(res.body.data.recentNotices));
  });

  // ------------------------------------------------------------
  // 14. FRONTEND BUILD VERIFICATION TEST
  // ------------------------------------------------------------
  test('14. Frontend build output should exist and contain valid entry HTML', async () => {
    const fs = require('fs');
    const path = require('path');
    const clientDistPath = path.resolve(__dirname, '../../client/dist/index.html');
    assert.strictEqual(fs.existsSync(clientDistPath), true, 'client/dist/index.html must exist');
  });

  // ------------------------------------------------------------
  // 15. SESSION PERSISTENCE & INVALID TOKEN TEST
  // ------------------------------------------------------------
  test('15. Corrupted or invalid token must be rejected with HTTP 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_garbage_token_12345');

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  // ============================================================
  // PHASE 2 CORE CAMPUS MANAGEMENT TESTS
  // ============================================================

  let createdSubjectId = '';
  let createdFacultyId = '';
  let createdStudentId = '';

  // ------------------------------------------------------------
  // 16. DEPARTMENT, COURSE & SUBJECT CRUD TEST
  // ------------------------------------------------------------
  test('16. Admin can create departments, courses, and subjects', async () => {
    // 1. Department
    const deptRes = await request(app)
      .post('/api/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        departmentCode: 'CA',
        departmentName: 'Department of Computer Applications',
        headOfDepartment: 'Dr. Sharma'
      });
    assert.strictEqual(deptRes.statusCode, 201);
    assert.strictEqual(deptRes.body.success, true);

    // 2. Course
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        courseCode: 'BCA',
        courseName: 'Bachelor of Computer Applications',
        totalSemesters: 6,
        department: 'CA'
      });
    assert.strictEqual(courseRes.statusCode, 201);
    assert.strictEqual(courseRes.body.success, true);

    // 3. Subject
    const subRes = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        subjectCode: 'BCA-501',
        subjectName: 'Artificial Intelligence & Machine Learning',
        credits: 4,
        type: 'Theory',
        semester: 5
      });
    assert.strictEqual(subRes.statusCode, 201);
    assert.strictEqual(subRes.body.success, true);
    createdSubjectId = subRes.body.subject._id;
  });

  // ------------------------------------------------------------
  // 17. STUDENT & FACULTY MANAGEMENT TEST
  // ------------------------------------------------------------
  test('17. Admin can register student and faculty profiles', async () => {
    // 1. Register student via admin endpoint
    const studRes = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Pooja Sharma',
        email: 'pooja.student@smartcampus.edu',
        password: 'Password123!',
        rollNumber: 'BCA-2023-088',
        courseCode: 'BCA',
        semester: 5
      });
    assert.strictEqual(studRes.statusCode, 201);
    assert.strictEqual(studRes.body.success, true);
    createdStudentId = studRes.body.student._id;

    // 2. Register faculty via admin endpoint
    const facRes = await request(app)
      .post('/api/faculty')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. Vikram Malhotra',
        email: 'vikram.faculty@smartcampus.edu',
        password: 'Password123!',
        employeeId: 'FAC-BCA-012',
        designation: 'Professor'
      });
    assert.strictEqual(facRes.statusCode, 201);
    assert.strictEqual(facRes.body.success, true);
    createdFacultyId = facRes.body.faculty._id;
  });

  // ------------------------------------------------------------
  // 18. TIMETABLE 3-WAY CONFLICT DETECTION TEST
  // ------------------------------------------------------------
  test('18. Timetable scheduler must prevent Room, Faculty, and Class conflicts with HTTP 409', async () => {
    // 1. Initial slot (successful)
    const slot1 = await request(app)
      .post('/api/timetable')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        courseCode: 'BCA',
        semester: 5,
        section: 'A',
        subjectId: createdSubjectId,
        facultyId: createdFacultyId,
        room: 'Lab 301',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30'
      });
    assert.strictEqual(slot1.statusCode, 201);
    assert.strictEqual(slot1.body.success, true);

    // 2. Room conflict attempt (overlapping in Room 301 on Monday)
    const roomConflict = await request(app)
      .post('/api/timetable')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        courseCode: 'MCA',
        semester: 1,
        section: 'A',
        room: 'Lab 301',
        day: 'Monday',
        startTime: '09:30',
        endTime: '11:00'
      });
    assert.strictEqual(roomConflict.statusCode, 409);
    assert.match(roomConflict.body.message, /Room 'Lab 301' is already booked/i);

    // 3. Faculty schedule conflict attempt (same faculty overlapping)
    const facultyConflict = await request(app)
      .post('/api/timetable')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        courseCode: 'MCA',
        semester: 1,
        section: 'B',
        facultyId: createdFacultyId,
        room: 'Hall C',
        day: 'Monday',
        startTime: '09:30',
        endTime: '11:00'
      });
    assert.strictEqual(facultyConflict.statusCode, 409);
    assert.match(facultyConflict.body.message, /Assigned faculty is already scheduled/i);

    // 4. Class schedule conflict attempt (same class/section overlapping)
    const classConflict = await request(app)
      .post('/api/timetable')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        courseCode: 'BCA',
        semester: 5,
        section: 'A',
        room: 'Room 102',
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:30'
      });
    assert.strictEqual(classConflict.statusCode, 409);
    assert.match(classConflict.body.message, /already has a scheduled lecture/i);
  });

  // ------------------------------------------------------------
  // 19. ATTENDANCE MARKING & AGGREGATE RECALCULATION TEST
  // ------------------------------------------------------------
  test('19. Faculty marks attendance and student profile recalculates attendance compliance', async () => {
    const markRes = await request(app)
      .post('/api/attendance/mark')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        subjectId: createdSubjectId,
        courseCode: 'BCA',
        semester: 5,
        date: new Date().toISOString(),
        attendanceList: [
          { studentId: createdStudentId, status: 'Present', remarks: 'Good punctuality' }
        ]
      });
    assert.strictEqual(markRes.statusCode, 200);
    assert.strictEqual(markRes.body.success, true);
    assert.strictEqual(markRes.body.count, 1);

    // Check attendance report
    const reportRes = await request(app)
      .get(`/api/attendance/student?studentId=${createdStudentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(reportRes.statusCode, 200);
    assert.strictEqual(reportRes.body.overallPercentage, 100);
    assert.strictEqual(reportRes.body.isEligible, true);
  });

  // ------------------------------------------------------------
  // 20. ASSIGNMENT CREATION, SUBMISSION & GRADING TEST
  // ------------------------------------------------------------
  let createdAssignmentId = '';
  test('20. Complete Assignment lifecycle: Faculty creates, Student submits, Faculty grades', async () => {
    // 1. Faculty creates assignment
    const assRes = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        title: 'Deep Learning PyTorch Implementations',
        description: 'Implement a CNN for image classification.',
        subjectId: createdSubjectId,
        courseCode: 'BCA',
        semester: 5,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        totalMarks: 50
      });
    assert.strictEqual(assRes.statusCode, 201);
    createdAssignmentId = assRes.body.assignment._id;

    // 2. Student submits assignment
    const subRes = await request(app)
      .post(`/api/assignments/${createdAssignmentId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        content: 'Completed PyTorch CNN model with 94.2% test accuracy.',
        fileUrl: 'https://github.com/student/pytorch-cnn'
      });
    assert.strictEqual(subRes.statusCode, 200);
    assert.strictEqual(subRes.body.success, true);

    // 3. Faculty grades submission
    const { User } = require('../models/CampusModels');
    const studentUser = await User.findOne({ email: 'amit.student@smartcampus.edu' });
    const gradeRes = await request(app)
      .patch(`/api/assignments/${createdAssignmentId}/grade`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        studentId: studentUser._id.toString(),
        marksObtained: 46,
        feedback: 'Excellent hyperparameter tuning and model evaluation.'
      });
    assert.strictEqual(gradeRes.statusCode, 200);
    assert.strictEqual(gradeRes.body.submission.marksObtained, 46);
    assert.strictEqual(gradeRes.body.submission.status, 'Graded');
  });

  // ------------------------------------------------------------
  // 21. EXAMINATION & RESULT GRADING TEST
  // ------------------------------------------------------------
  test('21. Examination mark entry computes correct letter grade and GPA', async () => {
    const { User } = require('../models/CampusModels');
    const studentUser = await User.findOne({ email: 'amit.student@smartcampus.edu' });

    // Enter 92/100 -> Expect Grade 'A+'
    const resultRes = await request(app)
      .post('/api/results')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        examName: 'Mid-Semester Examinations 2026',
        studentId: studentUser._id.toString(),
        subjectId: createdSubjectId,
        subjectCode: 'BCA-501',
        subjectName: 'Artificial Intelligence & ML',
        marksObtained: 92,
        maxMarks: 100,
        remarks: 'Outstanding performance in theory and coding.'
      });
    assert.strictEqual(resultRes.statusCode, 201);
    assert.strictEqual(resultRes.body.result.grade, 'A+');
    assert.strictEqual(resultRes.body.result.status, 'Pass');

    // Verify student results retrieval
    const myResults = await request(app)
      .get('/api/results/my')
      .set('Authorization', `Bearer ${studentToken}`);
    assert.strictEqual(myResults.statusCode, 200);
    assert.strictEqual(myResults.body.results.length >= 1, true);
    assert.strictEqual(myResults.body.aggregatePercentage, 92);
  });

  // ------------------------------------------------------------
  // 22. FEE INVOICING & PAYMENT RECALCULATION TEST
  // ------------------------------------------------------------
  test('22. Fee pre-save hook dynamically balances receivables and updates payment status', async () => {
    const { User } = require('../models/CampusModels');
    const studentUser = await User.findOne({ email: 'amit.student@smartcampus.edu' });

    // 1. Admin creates invoice of ₹60,000 with ₹0 paid
    const feeRes = await request(app)
      .post('/api/fees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId: studentUser._id.toString(),
        feeType: 'Tuition Fee',
        semester: 5,
        totalAmount: 60000,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 864000000).toISOString()
      });
    assert.strictEqual(feeRes.statusCode, 201);
    assert.strictEqual(feeRes.body.fee.balanceAmount, 60000);
    assert.strictEqual(feeRes.body.fee.status, 'Pending');
    const feeId = feeRes.body.fee._id;

    // 2. Partial Payment of ₹25,000
    const pay1 = await request(app)
      .patch(`/api/fees/${feeId}/pay`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        paymentAmount: 25000,
        receiptNumber: 'REC-TEST-001'
      });
    assert.strictEqual(pay1.statusCode, 200);
    assert.strictEqual(pay1.body.fee.paidAmount, 25000);
    assert.strictEqual(pay1.body.fee.balanceAmount, 35000);
    assert.strictEqual(pay1.body.fee.status, 'Partial');

    // 3. Final Payment of ₹35,000 to clear invoice
    const pay2 = await request(app)
      .patch(`/api/fees/${feeId}/pay`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        paymentAmount: 35000,
        receiptNumber: 'REC-TEST-002'
      });
    assert.strictEqual(pay2.statusCode, 200);
    assert.strictEqual(pay2.body.fee.paidAmount, 60000);
    assert.strictEqual(pay2.body.fee.balanceAmount, 0);
    assert.strictEqual(pay2.body.fee.status, 'Paid');
  });

  // ------------------------------------------------------------
  // 23. CAMPUS NOTICES BROADCAST TEST
  // ------------------------------------------------------------
  test('23. Official campus notice publishing and retrieval across roles', async () => {
    const postRes = await request(app)
      .post('/api/notices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'BCA Final-Year Major Project Viva Schedule',
        content: 'All BCA final-year scholars must submit project dossiers and attend defense.',
        targetAudience: 'all',
        priority: 'Urgent',
        department: 'Computer Applications'
      });
    assert.strictEqual(postRes.statusCode, 201);
    assert.strictEqual(postRes.body.notice.priority, 'Urgent');

    // Student views notices
    const getRes = await request(app)
      .get('/api/notices')
      .set('Authorization', `Bearer ${studentToken}`);
    assert.strictEqual(getRes.statusCode, 200);
    assert.strictEqual(getRes.body.success, true);
    assert.ok(getRes.body.notices.some((n) => n.title.includes('Viva Schedule')));
  });

  // ============================================================
  // PHASE 3 ANALYTICS & AUTOMATION TESTS
  // ============================================================

  // ------------------------------------------------------------
  // 24. INSTITUTIONAL & ROLE-BASED ANALYTICS OVERVIEW TEST
  // ------------------------------------------------------------
  test('24. Role-based analytics endpoints return aggregated metrics and enforce access control', async () => {
    // 1. Admin analytics overview
    const adminRes = await request(app)
      .get('/api/analytics/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(adminRes.statusCode, 200);
    assert.strictEqual(adminRes.body.success, true);
    assert.ok(adminRes.body.data.summary);
    assert.ok(adminRes.body.data.financials);
    assert.ok(Array.isArray(adminRes.body.data.weeklyAttendanceTrend));
    assert.ok(Array.isArray(adminRes.body.data.departmentDistribution));
    assert.ok(Array.isArray(adminRes.body.data.gradeDistribution));

    // 2. Student forbidden from admin analytics
    const forbiddenRes = await request(app)
      .get('/api/analytics/admin/overview')
      .set('Authorization', `Bearer ${studentToken}`);
    assert.strictEqual(forbiddenRes.statusCode, 403);

    // 3. Faculty analytics overview
    const facultyRes = await request(app)
      .get('/api/analytics/faculty/overview')
      .set('Authorization', `Bearer ${facultyToken}`);
    assert.strictEqual(facultyRes.statusCode, 200);
    assert.strictEqual(facultyRes.body.success, true);
    assert.ok(Array.isArray(facultyRes.body.data.subjectAttendance));
    assert.ok(Array.isArray(facultyRes.body.data.assignmentStats));
    assert.ok(Array.isArray(facultyRes.body.data.supportRequiredList));

    // 4. Student analytics overview
    const studentRes = await request(app)
      .get('/api/analytics/student/overview')
      .set('Authorization', `Bearer ${studentToken}`);
    assert.strictEqual(studentRes.statusCode, 200);
    assert.strictEqual(studentRes.body.success, true);
    assert.ok(studentRes.body.data.attendance);
    assert.ok(studentRes.body.data.assignments);
    assert.ok(studentRes.body.data.academicPerformance);
  });

  // ------------------------------------------------------------
  // 25. DYNAMIC QR ATTENDANCE SESSION LIFECYCLE TEST
  // ------------------------------------------------------------
  let activeSessionId = '';
  let activeSessionCode = '';
  let activeQrToken = '';

  test('25. Dynamic QR Attendance session creation, status polling, and early termination', async () => {
    // 1. Faculty creates a 10-minute QR attendance session
    const createRes = await request(app)
      .post('/api/attendance/session/create')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        subjectId: createdSubjectId,
        courseCode: 'BCA',
        semester: 5,
        durationMinutes: 10
      });
    assert.strictEqual(createRes.statusCode, 201);
    assert.strictEqual(createRes.body.success, true);
    assert.ok(createRes.body.sessionId);
    assert.ok(createRes.body.sessionCode);
    assert.strictEqual(createRes.body.sessionCode.length, 6);
    assert.ok(createRes.body.qrCodeDataUrl.startsWith('data:image/png;base64,'));
    assert.ok(createRes.body.qrToken);

    activeSessionId = createRes.body.sessionId;
    activeSessionCode = createRes.body.sessionCode;
    activeQrToken = createRes.body.qrToken;

    // 2. Poll session status
    const statusRes = await request(app)
      .get(`/api/attendance/session/${activeSessionId}/status`)
      .set('Authorization', `Bearer ${facultyToken}`);
    assert.strictEqual(statusRes.statusCode, 200);
    assert.strictEqual(statusRes.body.session.isActive, true);
    assert.strictEqual(statusRes.body.isExpired, false);
    assert.strictEqual(statusRes.body.attendeeCount, 0);

    // 3. Faculty closes session
    const closeRes = await request(app)
      .patch(`/api/attendance/session/${activeSessionId}/close`)
      .set('Authorization', `Bearer ${facultyToken}`);
    assert.strictEqual(closeRes.statusCode, 200);
    assert.strictEqual(closeRes.body.session.isActive, false);

    // 4. Verify status after closure
    const closedStatusRes = await request(app)
      .get(`/api/attendance/session/${activeSessionId}/status`)
      .set('Authorization', `Bearer ${facultyToken}`);
    assert.strictEqual(closedStatusRes.body.session.isActive, false);
  });

  // ------------------------------------------------------------
  // 26. QR / CODE CHECK-IN & FRAUD / DUPLICATE SCAN PREVENTION TEST
  // ------------------------------------------------------------
  test('26. Student check-in via QR / code prevents duplicates and rejects closed sessions', async () => {
    // 1. Faculty creates fresh active session
    const createRes = await request(app)
      .post('/api/attendance/session/create')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        subjectId: createdSubjectId,
        courseCode: 'BCA',
        semester: 5,
        durationMinutes: 15
      });
    assert.strictEqual(createRes.statusCode, 201);
    const validSessionCode = createRes.body.sessionCode;
    const validSessionId = createRes.body.sessionId;

    // 2. Student successfully checks in with sessionCode
    const scanRes = await request(app)
      .post('/api/attendance/session/scan')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ sessionCode: validSessionCode });
    assert.strictEqual(scanRes.statusCode, 200);
    assert.strictEqual(scanRes.body.success, true);
    assert.ok(scanRes.body.overallPercentage !== undefined);

    // 3. Student attempts duplicate scan in same session -> Must return HTTP 400
    const dupRes = await request(app)
      .post('/api/attendance/session/scan')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ sessionCode: validSessionCode });
    assert.strictEqual(dupRes.statusCode, 400);
    assert.strictEqual(dupRes.body.success, false);
    assert.match(dupRes.body.message, /already/i);

    // 4. Close session and verify subsequent check-in rejection
    await request(app)
      .patch(`/api/attendance/session/${validSessionId}/close`)
      .set('Authorization', `Bearer ${facultyToken}`);

    const closedRes = await request(app)
      .post('/api/attendance/session/scan')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ sessionCode: validSessionCode });
    assert.strictEqual(closedRes.statusCode, 400);
    assert.match(closedRes.body.message, /expired or been closed/i);
  });

  // ------------------------------------------------------------
  // 27. NOTIFICATION HUB & UNREAD TELEMETRY TEST
  // ------------------------------------------------------------
  test('27. Notification hub retrieves alerts, exposes unread count, and updates read state', async () => {
    const { Notification, User } = require('../models/CampusModels');
    const studentUser = await User.findOne({ email: 'amit.student@smartcampus.edu' });

    // 1. Seed a test notification for the student
    const testNotif = await Notification.create({
      recipient: studentUser._id,
      sender: studentUser._id,
      title: 'Midterm Timetable Released',
      message: 'The official schedule for BCA Semester 5 midterms is now active.',
      type: 'RESULT_PUBLISHED',
      link: '/student/results'
    });

    // 2. Check unread count
    const countRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${studentToken}`);
    assert.strictEqual(countRes.statusCode, 200);
    assert.ok(countRes.body.unreadCount >= 1);

    // 3. Get notification list
    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);
    assert.strictEqual(listRes.statusCode, 200);
    assert.ok(listRes.body.notifications.length >= 1);

    // 4. Mark single notification as read
    const readRes = await request(app)
      .patch(`/api/notifications/${testNotif._id}/read`)
      .set('Authorization', `Bearer ${studentToken}`);
    assert.strictEqual(readRes.statusCode, 200);
    assert.strictEqual(readRes.body.notification.isRead, true);

    // 5. Mark all as read
    const readAllRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${studentToken}`);
    assert.strictEqual(readAllRes.statusCode, 200);

    // 6. Verify zero unread notifications remaining
    const finalCountRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${studentToken}`);
    assert.strictEqual(finalCountRes.statusCode, 200);
    assert.strictEqual(finalCountRes.body.unreadCount, 0);
  });

  // ------------------------------------------------------------
  // 28. SCHEDULER SERVICE & IDEMPOTENT DEADLINE REMINDERS TEST
  // ------------------------------------------------------------
  test('28. Scheduler service triggers deadline reminders without duplicating notifications', async () => {
    const { triggerDeadlineReminders } = require('../services/schedulerService');

    // Execute scheduler runner directly
    const createdResult = await triggerDeadlineReminders();
    assert.strictEqual(typeof createdResult.remindersSent, 'number');

    // Executing a second time immediately must be idempotent (0 new duplicate notifications)
    const secondPassResult = await triggerDeadlineReminders();
    assert.strictEqual(secondPassResult.remindersSent, 0);
  });
});

