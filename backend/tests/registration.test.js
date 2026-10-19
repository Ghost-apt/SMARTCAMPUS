const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { closeDB } = require('../config/database');
const { User, RegistrationRequest, StudentProfile, AuditLog, Notification } = require('../models/CampusModels');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_smartcampus_2026';

let mongoServer;
let app;
let adminToken = '';
let studentToken = '';

describe('SmartCampus AI — Student Registration & Admin Approval Verification Suite', () => {
  before(async () => {
    if (process.env.MONGODB_URI) {
      await mongoose.disconnect();
      await mongoose.connect(process.env.MONGODB_URI);
    } else {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      process.env.MONGODB_URI = uri;
      await mongoose.disconnect();
      await mongoose.connect(uri);
    }

    app = require('../server');

    // Create an authorized admin user for approval testing
    const adminUser = await User.create({
      name: 'System Dean Administrator',
      email: 'dean.admin@smartcampus.edu',
      password: 'AdminPassword123!',
      role: 'admin',
      accountStatus: 'active',
      approvalStatus: 'APPROVED'
    });

    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: 'admin', name: adminUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  });

  after(async () => {
    await closeDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // ------------------------------------------------------------
  // 1. PUBLIC REGISTRATION SUBMITS PENDING REQUEST (NO TOKEN ISSUED)
  // ------------------------------------------------------------
  let regReference = '';
  test('1. Public student registration submits a persistent PENDING request without immediate login', async () => {
    const payload = {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@applicant.edu',
      password: 'SecurePassword2026!',
      role: 'student',
      department: 'Computer Applications',
      course: 'BCA',
      semester: 1,
      academicYear: '2026-2027',
      phone: '+91 9876543210'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .set('x-enforce-approval', 'true')
      .send(payload);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.pendingApproval, true);
    assert.ok(res.body.registrationId);
    assert.ok(res.body.registrationId.startsWith('REG-'));
    assert.strictEqual(res.body.token, undefined); // Token MUST NOT be issued before approval!
    assert.strictEqual(res.body.applicant.status, 'PENDING');

    regReference = res.body.registrationId;

    // Verify stored in MongoDB
    const storedReq = await RegistrationRequest.findOne({ registrationId: regReference });
    assert.ok(storedReq);
    assert.strictEqual(storedReq.status, 'PENDING');
    assert.strictEqual(storedReq.email, 'rohan.sharma@applicant.edu');

    // Verify underlying user account is in pending state
    const user = await User.findOne({ email: 'rohan.sharma@applicant.edu' });
    assert.ok(user);
    assert.strictEqual(user.accountStatus, 'pending');
    assert.strictEqual(user.approvalStatus, 'PENDING');
  });

  // ------------------------------------------------------------
  // 2. PRIVILEGE ESCALATION PREVENTION
  // ------------------------------------------------------------
  test('2. Public registration rejects any attempt to register as admin (HTTP 403)', async () => {
    const maliciousPayload = {
      name: 'Attacker Admin',
      email: 'attacker@smartcampus.edu',
      password: 'HackerPassword123!',
      role: 'admin'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .set('x-enforce-approval', 'true')
      .send(maliciousPayload);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /restricted/i);

    // Verify user was NOT created
    const user = await User.findOne({ email: 'attacker@smartcampus.edu' });
    assert.strictEqual(user, null);
  });

  // ------------------------------------------------------------
  // 3. DUPLICATE REGISTRATION REJECTION
  // ------------------------------------------------------------
  test('3. Duplicate registration with an already pending email is safely rejected (HTTP 400)', async () => {
    const duplicatePayload = {
      name: 'Rohan Sharma Duplicate',
      email: 'rohan.sharma@applicant.edu',
      password: 'AnotherPassword123!',
      role: 'student'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .set('x-enforce-approval', 'true')
      .send(duplicatePayload);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /already exists|already pending/i);
  });

  // ------------------------------------------------------------
  // 4. PASSWORD SECURITY & PROTECTION
  // ------------------------------------------------------------
  test('4. Applicant password is securely hashed and never exposed in queries or status API', async () => {
    const userDoc = await User.findOne({ email: 'rohan.sharma@applicant.edu' }).select('+password');
    assert.ok(userDoc);
    assert.notStrictEqual(userDoc.password, 'SecurePassword2026!');
    assert.ok(userDoc.password.startsWith('$2')); // bcrypt salt indicator

    // Check RegistrationRequest password exclusion
    const reqDoc = await RegistrationRequest.findOne({ registrationId: regReference });
    assert.strictEqual(reqDoc.password, undefined); // Default select: false
  });

  // ------------------------------------------------------------
  // 5. PENDING APPLICANT LOGIN GATING
  // ------------------------------------------------------------
  test('5. Pending applicant cannot log in and receives HTTP 403 awaiting approval', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'rohan.sharma@applicant.edu',
      password: 'SecurePassword2026!'
    });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.approvalStatus, 'PENDING');
    assert.match(res.body.message, /awaiting administrative approval/i);
    assert.strictEqual(res.body.token, undefined);
  });

  // ------------------------------------------------------------
  // 6. PUBLIC REGISTRATION STATUS INQUIRY
  // ------------------------------------------------------------
  test('6. GET /api/auth/registration-status allows applicant to verify status without secrets', async () => {
    const res = await request(app)
      .get(`/api/auth/registration-status?reference=${regReference}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.registration.registrationId, regReference);
    assert.strictEqual(res.body.registration.status, 'PENDING');
    assert.strictEqual(res.body.registration.name, 'Rohan Sharma');
    assert.strictEqual(res.body.registration.department, 'Computer Applications');
    assert.strictEqual(res.body.registration.password, undefined);
    assert.strictEqual(res.body.registration.token, undefined);
  });

  // ------------------------------------------------------------
  // 7. UNAUTHORIZED ADMIN ROUTE ACCESS DENIED
  // ------------------------------------------------------------
  test('7. Unauthorized and student users cannot access admin registration management (HTTP 401/403)', async () => {
    // Unauthenticated
    const resUnauth = await request(app).get('/api/admin/registration-requests');
    assert.strictEqual(resUnauth.statusCode, 401);

    // Student token attempt
    const jwt = require('jsonwebtoken');
    const dummyStudentToken = jwt.sign(
      { id: new mongoose.Types.ObjectId(), email: 'dummy@test.edu', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resForbidden = await request(app)
      .get('/api/admin/registration-requests')
      .set('Authorization', `Bearer ${dummyStudentToken}`);
    assert.strictEqual(resForbidden.statusCode, 403);
  });

  // ------------------------------------------------------------
  // 8. ADMIN LISTS & INSPECTS REGISTRATION REQUESTS
  // ------------------------------------------------------------
  test('8. Admin can list registration requests and view details with live pending count', async () => {
    const res = await request(app)
      .get('/api/admin/registration-requests?status=PENDING')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.pendingCount >= 1);
    assert.ok(Array.isArray(res.body.requests));

    const targetReq = res.body.requests.find((r) => r.registrationId === regReference);
    assert.ok(targetReq);
    assert.strictEqual(targetReq.name, 'Rohan Sharma');
    assert.strictEqual(targetReq.status, 'PENDING');

    // Get single by ID
    const singleRes = await request(app)
      .get(`/api/admin/registration-requests/${regReference}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(singleRes.statusCode, 200);
    assert.strictEqual(singleRes.body.request.registrationId, regReference);
  });

  // ------------------------------------------------------------
  // 9. ADMIN APPROVAL ACTIVATES ACCOUNT & ISSUES ROLL NUMBER
  // ------------------------------------------------------------
  let approvedStudentId = '';
  test('9. Admin approval activates student account, creates StudentProfile, and records audit log', async () => {
    const res = await request(app)
      .post(`/api/admin/registration-requests/${regReference}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Credentials verified against official transcripts.' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.registration.status, 'APPROVED');
    assert.ok(res.body.assignedStudentId);

    approvedStudentId = res.body.assignedStudentId;

    // Verify User account state updated
    const user = await User.findOne({ email: 'rohan.sharma@applicant.edu' });
    assert.strictEqual(user.accountStatus, 'active');
    assert.strictEqual(user.approvalStatus, 'APPROVED');
    assert.strictEqual(user.studentId, approvedStudentId);

    // Verify linked StudentProfile created
    const profile = await StudentProfile.findOne({ user: user._id });
    assert.ok(profile);
    assert.strictEqual(profile.rollNumber, approvedStudentId);
    assert.strictEqual(profile.department, 'Computer Applications');

    // Verify AuditLog record exists
    const audit = await AuditLog.findOne({
      action: 'REGISTRATION_APPROVED',
      resourceId: regReference
    });
    assert.ok(audit);
    assert.strictEqual(audit.actorRole, 'admin');

    // Verify In-App Notification created
    const notif = await Notification.findOne({
      recipient: user._id,
      type: 'REGISTRATION_APPROVED'
    });
    assert.ok(notif);
  });

  // ------------------------------------------------------------
  // 10. APPROVED STUDENT LOGIN SUCCESS
  // ------------------------------------------------------------
  test('10. Approved student can now successfully log in and access student dashboard', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'rohan.sharma@applicant.edu',
      password: 'SecurePassword2026!'
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'student');
    assert.strictEqual(res.body.user.studentId, approvedStudentId);
    assert.strictEqual(res.body.user.accountStatus, 'active');

    studentToken = res.body.token;

    // Student can now access authenticated /api/auth/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(meRes.statusCode, 200);
    assert.strictEqual(meRes.body.user.email, 'rohan.sharma@applicant.edu');
    assert.strictEqual(meRes.body.user.studentId, approvedStudentId);
  });

  // ------------------------------------------------------------
  // 11. ROSTER SEPARATION: ONLY APPROVED STUDENTS APPEAR IN GET /api/students
  // ------------------------------------------------------------
  test('11. Approved student appears in official roster; pending applicants do not', async () => {
    // Create another pending applicant that is NOT approved
    await request(app)
      .post('/api/auth/register')
      .set('x-enforce-approval', 'true')
      .send({
        name: 'Pending Applicant',
        email: 'pending.unapproved@applicant.edu',
        password: 'Password123!',
        role: 'student',
        department: 'Computer Applications'
      });

    const rosterRes = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(rosterRes.statusCode, 200);
    const emails = rosterRes.body.students.map((s) => s.email);

    // Rohan (approved) MUST be in the roster
    assert.ok(emails.includes('rohan.sharma@applicant.edu'));
    // Pending applicant MUST NOT be in the official roster
    assert.strictEqual(emails.includes('pending.unapproved@applicant.edu'), false);
  });

  // ------------------------------------------------------------
  // 12. DUPLICATE APPROVAL REJECTION
  // ------------------------------------------------------------
  test('12. Attempting to approve an already approved request returns HTTP 400', async () => {
    const res = await request(app)
      .post(`/api/admin/registration-requests/${regReference}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /already APPROVED/i);
  });

  // ------------------------------------------------------------
  // 13. ADMIN REJECTION FLOW
  // ------------------------------------------------------------
  let rejectRegId = '';
  test('13. Admin can reject a registration request with reason; user account remains disabled', async () => {
    // Register candidate to reject
    const regRes = await request(app)
      .post('/api/auth/register')
      .set('x-enforce-approval', 'true')
      .send({
        name: 'Ineligible Applicant',
        email: 'ineligible@applicant.edu',
        password: 'Password123!',
        role: 'student',
        department: 'BCA'
      });

    rejectRegId = regRes.body.registrationId;

    // Admin rejects request
    const rejectRes = await request(app)
      .post(`/api/admin/registration-requests/${rejectRegId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Prerequisite mathematics requirement not satisfied.' });

    assert.strictEqual(rejectRes.statusCode, 200);
    assert.strictEqual(rejectRes.body.success, true);
    assert.strictEqual(rejectRes.body.registration.status, 'REJECTED');

    // User attempts login -> rejected with 403
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'ineligible@applicant.edu',
      password: 'Password123!'
    });

    assert.strictEqual(loginRes.statusCode, 403);
    assert.strictEqual(loginRes.body.approvalStatus, 'REJECTED');
    assert.match(loginRes.body.message, /rejected by university administration/i);

    // Public status reflects rejection
    const statusRes = await request(app).get(`/api/auth/registration-status?reference=${rejectRegId}`);
    assert.strictEqual(statusRes.statusCode, 200);
    assert.strictEqual(statusRes.body.registration.status, 'REJECTED');
    assert.strictEqual(statusRes.body.registration.rejectionReason, 'Prerequisite mathematics requirement not satisfied.');

    // AuditLog records rejection
    const audit = await AuditLog.findOne({
      action: 'REGISTRATION_REJECTED',
      resourceId: rejectRegId
    });
    assert.ok(audit);
  });

  // ------------------------------------------------------------
  // 14. ADMIN REGISTRATION METRICS & FILTERS
  // ------------------------------------------------------------
  test('14. Admin can query registration metrics and filter by APPROVED and REJECTED status', async () => {
    const approvedRes = await request(app)
      .get('/api/admin/registration-requests?status=APPROVED')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(approvedRes.statusCode, 200);
    assert.ok(approvedRes.body.requests.some((r) => r.registrationId === regReference));

    const rejectedRes = await request(app)
      .get('/api/admin/registration-requests?status=REJECTED')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(rejectedRes.statusCode, 200);
    assert.ok(rejectedRes.body.requests.some((r) => r.registrationId === rejectRegId));

    // Live pending count endpoint
    const countRes = await request(app)
      .get('/api/admin/registration-requests/count/pending')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(countRes.statusCode, 200);
    assert.strictEqual(typeof countRes.body.pendingCount, 'number');
  });
});
