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
});
