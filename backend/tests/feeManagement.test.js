/**
 * SmartCampus AI — Dynamic Fee Structure & Course-Wise Fee Management Test Suite
 * 
 * Verifies:
 * 1. Admin creates course fee structure (BCA, MCA) with semester categories
 * 2. Student cannot create fee structure (HTTP 403)
 * 3. Admin publishes fee structure (verifies non-negative amounts, sets status to PUBLISHED)
 * 4. Updating a published structure creates Version 2 preserving Version 1
 * 5. Student registration approval auto-assigns published fee structure assessments
 * 6. Student views fees: registration fee and semester tuition distinct
 * 7. Admin records verified offline payment (cash/bank transfer)
 * 8. Student cannot call offline-pay (HTTP 403)
 * 9. Offline payment amount exceeding balance is rejected (HTTP 400)
 * 10. Duplicate offline reference is rejected (HTTP 400)
 * 11. Paying only registration fee marks registration fee Paid, but semester tuition remains Pending
 * 12. Online payment + Offline payment combine accurately without double-counting
 * 13. AuditLog and Notification records created for governance
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_smartcampus_2026';
process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_campus_key_2026';
process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_secret_key_2026';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_razorpay_webhook_secret_2026';

let mongoServer;
let app;
let studentToken;
let studentUser;
let adminToken;
let adminUser;
let createdStructureId;
let publishedStructureId;
let tuitionFeeRecordId;
let regFeeRecordId;

describe('SmartCampus AI — Dynamic Fee Structure & Fee Management Suite', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    app = require('../server');
    const { User, StudentProfile } = require('../models/CampusModels');

    // Create Admin User
    adminUser = await User.create({
      name: 'Finance Dean',
      email: 'finance.dean@smartcampus.edu',
      password: 'Password123!',
      role: 'admin',
      department: 'Finance'
    });

    // Create Student User
    studentUser = await User.create({
      name: 'Aarav Patel',
      email: 'aarav.patel@smartcampus.edu',
      password: 'Password123!',
      role: 'student',
      department: 'Computer Applications',
      studentId: 'STU-2026-BCA-889',
      approvalStatus: 'APPROVED',
      accountStatus: 'active'
    });

    await StudentProfile.create({
      user: studentUser._id,
      rollNumber: 'BCA-2026-889',
      department: 'Computer Applications',
      course: 'BCA',
      semester: 1,
      batch: '2026-2029'
    });

    // Generate JWT tokens
    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign(
      { id: adminUser._id, role: adminUser.role, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    studentToken = jwt.sign(
      { id: studentUser._id, role: studentUser.role, email: studentUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('1. Admin can create course fee structure (BCA) with categories', async () => {
    const payload = {
      name: 'BCA 2026 Batch Standard Fee Structure',
      course: 'BCA',
      courseName: 'Bachelor of Computer Applications',
      department: 'Computer Applications',
      academicYear: '2026-2027',
      semesters: [1, 2],
      cohort: '2026 Batch',
      currency: 'INR',
      categories: [
        {
          feeType: 'Registration Fee',
          categoryName: 'One-Time University Admission & Registration Fee',
          amount: 2500,
          semester: 1,
          frequency: 'ONE_TIME',
          mandatory: true,
          description: 'Official enrollment, student ID card, and registration file.'
        },
        {
          feeType: 'Tuition Fee',
          categoryName: 'Semester Academic Tuition Fee',
          amount: 40000,
          semester: 1,
          frequency: 'PER_SEMESTER',
          mandatory: true,
          description: 'Faculty instruction and credit hours.'
        },
        {
          feeType: 'Lab Fee',
          categoryName: 'Computing & AI Sandbox Fee',
          amount: 3000,
          semester: 1,
          frequency: 'PER_SEMESTER',
          mandatory: true,
          description: 'Cloud workstation and laboratory compute.'
        }
      ]
    };

    const res = await request(app)
      .post('/api/fees/structures')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.structure.course, 'BCA');
    assert.equal(res.body.structure.status, 'DRAFT');
    assert.equal(res.body.structure.version, 1);
    assert.equal(res.body.structure.totalMandatorySemester, 45500);
    createdStructureId = res.body.structure._id;
  });

  test('2. Student cannot create fee structure (HTTP 403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/fees/structures')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        name: 'Hacked Fee Structure',
        course: 'BCA',
        amount: 0
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test('3. Admin can publish fee structure (verifies non-negative amounts, sets status to PUBLISHED)', async () => {
    const res = await request(app)
      .post(`/api/fees/structures/${createdStructureId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.structure.status, 'PUBLISHED');
    assert.ok(res.body.structure.publishedAt);
    publishedStructureId = res.body.structure._id;
  });

  test('4. Updating a published structure creates Version 2 preserving Version 1', async () => {
    const updatePayload = {
      description: 'Updated BCA Fee Structure with updated Lab compute allocation',
      categories: [
        {
          feeType: 'Registration Fee',
          categoryName: 'One-Time University Admission & Registration Fee',
          amount: 2500,
          semester: 1,
          frequency: 'ONE_TIME',
          mandatory: true
        },
        {
          feeType: 'Tuition Fee',
          categoryName: 'Semester Academic Tuition Fee',
          amount: 42000,
          semester: 1,
          frequency: 'PER_SEMESTER',
          mandatory: true
        },
        {
          feeType: 'Lab Fee',
          categoryName: 'Computing & AI Sandbox Fee',
          amount: 3500,
          semester: 1,
          frequency: 'PER_SEMESTER',
          mandatory: true
        }
      ]
    };

    const res = await request(app)
      .patch(`/api/fees/structures/${publishedStructureId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatePayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.isNewVersion, true);
    assert.equal(res.body.structure.version, 2);
    assert.equal(res.body.structure.previousVersionId.toString(), publishedStructureId.toString());

    // Check version history endpoint
    const historyRes = await request(app)
      .get(`/api/fees/structures/${res.body.structure._id}/versions`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(historyRes.status, 200);
    assert.ok(historyRes.body.count >= 2);
  });

  test('5. Student registration approval auto-assigns published fee structure assessments', async () => {
    const { FeeRecord, User } = require('../models/CampusModels');

    // 1. Submit public student registration
    const regPayload = {
      name: 'Kavita Iyer',
      email: 'kavita.fee@smartcampus.edu',
      password: 'SecurePassword2026!',
      role: 'student',
      department: 'Computer Applications',
      course: 'BCA',
      semester: 1,
      academicYear: '2026-2027',
      phone: '+91 9876543210'
    };

    const regRes = await request(app)
      .post('/api/auth/register')
      .set('x-enforce-approval', 'true')
      .send(regPayload);

    assert.equal(regRes.status, 201);
    assert.ok(regRes.body.registrationId);
    const regRef = regRes.body.registrationId;

    // 2. Admin approves the registration request
    const approveRes = await request(app)
      .post(`/api/admin/registration-requests/${regRef}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Verified credentials and approved admission' });

    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.body.success, true);

    const kavitaUser = await User.findOne({ email: 'kavita.fee@smartcampus.edu' });
    assert.ok(kavitaUser);
    assert.equal(kavitaUser.approvalStatus, 'APPROVED');

    // 3. Verify FeeRecord assessments were automatically generated
    const assignedFees = await FeeRecord.find({ student: kavitaUser._id });
    assert.ok(assignedFees.length >= 2, `Expected at least 2 fee assessments, found ${assignedFees.length}`);

    const regFee = assignedFees.find((f) => /registration/i.test(f.feeType));
    const tuitionFee = assignedFees.find((f) => /tuition/i.test(f.feeType));

    assert.ok(regFee, 'Registration Fee assessment must be created');
    assert.equal(regFee.totalAmount, 2500);
    assert.equal(regFee.paidAmount, 0);
    assert.equal(regFee.balanceAmount, 2500);
    assert.equal(regFee.status, 'Pending');

    assert.ok(tuitionFee, 'Tuition Fee assessment must be created');
    assert.equal(tuitionFee.totalAmount, 40000);
    assert.equal(tuitionFee.paidAmount, 0);
    assert.equal(tuitionFee.balanceAmount, 40000);
    assert.equal(tuitionFee.status, 'Pending');

    // Store for subsequent payment tests
    regFeeRecordId = regFee._id.toString();
    tuitionFeeRecordId = tuitionFee._id.toString();

    // 4. Student logs in to get official JWT token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'kavita.fee@smartcampus.edu',
        password: 'SecurePassword2026!'
      });

    assert.equal(loginRes.status, 200);
    assert.ok(loginRes.body.token);
    kavitaToken = loginRes.body.token;
  });

  let kavitaToken;

  test('6. Student views fees: registration fee and semester tuition distinct with accurate balance', async () => {
    const res = await request(app)
      .get('/api/fees/my')
      .set('Authorization', `Bearer ${kavitaToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.registrationFeeBilled, 2500);
    assert.equal(res.body.registrationFeePaid, 0);
    assert.equal(res.body.registrationFeeBalance, 2500);
    assert.equal(res.body.registrationFeeStatus, 'Pending');

    assert.ok(res.body.academicFeesBilled >= 40000);
    assert.equal(res.body.academicFeesPaid, 0);
    assert.equal(res.body.academicFeesStatus, 'Pending');
    assert.equal(res.body.totalBalance, res.body.registrationFeeBalance + res.body.academicFeesBalance);
  });

  test('7. Admin records verified offline payment (cash) on Registration Fee', async () => {
    const offlinePayload = {
      feeRecordId: regFeeRecordId,
      amount: 2500,
      paymentMethod: 'Cash',
      referenceNumber: 'CASH-REC-2026-001',
      remarks: 'Paid in cash at University Accounts counter'
    };

    const res = await request(app)
      .post('/api/fees/offline-pay')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(offlinePayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.transaction.paymentChannel, 'OFFLINE');
    assert.equal(res.body.transaction.status, 'captured');
    assert.equal(res.body.transaction.amount, 2500);
    assert.equal(res.body.transaction.offlineReference, 'CASH-REC-2026-001');

    assert.equal(res.body.fee.paidAmount, 2500);
    assert.equal(res.body.fee.offlinePaidAmount, 2500);
    assert.equal(res.body.fee.balanceAmount, 0);
    assert.equal(res.body.fee.status, 'Paid');
  });

  test('8. Student cannot call offline-pay (HTTP 403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/fees/offline-pay')
      .set('Authorization', `Bearer ${kavitaToken}`)
      .send({
        feeRecordId: tuitionFeeRecordId,
        amount: 5000,
        paymentMethod: 'Cash'
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test('9. Offline payment amount exceeding balance is rejected (HTTP 400)', async () => {
    // tuition balance is 40000, attempt to pay 50000
    const res = await request(app)
      .post('/api/fees/offline-pay')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        feeRecordId: tuitionFeeRecordId,
        amount: 50000,
        paymentMethod: 'Bank Transfer',
        referenceNumber: 'BANK-NEFT-OVERFLOW-01'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(/exceeds/i.test(res.body.message));
  });

  test('10. Duplicate offline reference is rejected (HTTP 400)', async () => {
    // CASH-REC-2026-001 was already used in test 7
    const res = await request(app)
      .post('/api/fees/offline-pay')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        feeRecordId: tuitionFeeRecordId,
        amount: 10000,
        paymentMethod: 'Bank Transfer',
        referenceNumber: 'CASH-REC-2026-001'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(/already been recorded/i.test(res.body.message));
  });

  test('11. Paying only registration fee marks registration fee Paid, but semester tuition remains Pending', async () => {
    const res = await request(app)
      .get('/api/fees/my')
      .set('Authorization', `Bearer ${kavitaToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.registrationFeePaid, 2500);
    assert.equal(res.body.registrationFeeBalance, 0);
    assert.equal(res.body.registrationFeeStatus, 'Paid');

    // Tuition fee must strictly remain Pending with positive balance
    assert.ok(res.body.academicFeesBalance >= 40000);
    assert.equal(res.body.academicFeesStatus, 'Pending');
    assert.ok(res.body.totalBalance >= 40000);
  });

  test('12. Online payment + Offline payment combine accurately without double-counting', async () => {
    // Record partial offline payment on tuition fee of 15,000
    const offlineRes = await request(app)
      .post('/api/fees/offline-pay')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        feeRecordId: tuitionFeeRecordId,
        amount: 15000,
        paymentMethod: 'Demand Draft',
        referenceNumber: 'DD-SBI-998877',
        remarks: 'First partial payment via DD'
      });

    assert.equal(offlineRes.status, 200);
    assert.equal(offlineRes.body.fee.paidAmount, 15000);
    assert.equal(offlineRes.body.fee.offlinePaidAmount, 15000);
    assert.equal(offlineRes.body.fee.balanceAmount, 25000);
    assert.equal(offlineRes.body.fee.status, 'Partial');

    // Student now pays remaining 10,000 online via Razorpay order + signature
    const orderRes = await request(app)
      .post('/api/fees/order')
      .set('Authorization', `Bearer ${kavitaToken}`)
      .send({
        feeId: tuitionFeeRecordId,
        partialAmount: 10000
      });

    assert.equal(orderRes.status, 200);
    const { orderId, amount } = orderRes.body;
    assert.equal(amount, 10000);

    const mockPaymentId = `pay_online_test_${Date.now()}`;
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${mockPaymentId}`);
    const validSignature = hmac.digest('hex');

    const verifyRes = await request(app)
      .post('/api/fees/verify')
      .set('Authorization', `Bearer ${kavitaToken}`)
      .send({
        orderId,
        paymentId: mockPaymentId,
        signature: validSignature
      });

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.fee.paidAmount, 25000);
    assert.equal(verifyRes.body.fee.offlinePaidAmount, 15000);
    assert.equal(verifyRes.body.fee.onlinePaidAmount, 10000);
    assert.equal(verifyRes.body.fee.balanceAmount, 15000);

    // Verify in student dashboard
    const summaryRes = await request(app)
      .get('/api/fees/my')
      .set('Authorization', `Bearer ${kavitaToken}`);

    assert.equal(summaryRes.status, 200);
    assert.equal(summaryRes.body.offlinePaidTotal, 17500); // 2500 reg + 15000 tuition
    assert.equal(summaryRes.body.onlinePaidTotal, 10000);  // 10000 tuition online
    assert.equal(summaryRes.body.totalPaid, 27500);       // 17500 + 10000
  });

  test('13. AuditLog and Notification records exist for fee structure creation, publication, and offline payments', async () => {
    const { AuditLog, Notification } = require('../models/CampusModels');

    const structureAudit = await AuditLog.findOne({ action: 'FEE_STRUCTURE_CREATED' });
    assert.ok(structureAudit, 'AuditLog for FEE_STRUCTURE_CREATED must exist');

    const publishAudit = await AuditLog.findOne({ action: 'FEE_STRUCTURE_PUBLISHED' });
    assert.ok(publishAudit, 'AuditLog for FEE_STRUCTURE_PUBLISHED must exist');

    const offlineAudit = await AuditLog.findOne({ action: 'OFFLINE_PAYMENT_RECORDED' });
    assert.ok(offlineAudit, 'AuditLog for OFFLINE_PAYMENT_RECORDED must exist');

    const notif = await Notification.findOne({ type: 'PAYMENT_RECEIVED' });
    assert.ok(notif, 'Notification for PAYMENT_RECEIVED must exist');
    assert.ok(notif.message.includes('offline payment') || notif.message.includes('credited'));
  });
});
