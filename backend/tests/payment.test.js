/**
 * SmartCampus AI — Payment System Verification & Acceptance Test Suite
 * 
 * Tests the complete payment lifecycle according to university requirements:
 * - Test A: Student fee dashboard & authorized assessment categories
 * - Test B: Authoritative payment order creation & ownership validation
 * - Test C: Cryptographic HMAC signature verification & tamper defense
 * - Test D: Currency-safe balance update and concession reconciliation
 * - Test E: Webhook HMAC verification and durable database-level idempotency
 * - Test F: Downloadable PDF receipt generation and authorization protection
 * - Test G: Role-based access control and student isolation
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { closeDB } = require('../config/database');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_smartcampus_2026';
process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_campus_key_2026';
process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_secret_key_2026';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_razorpay_webhook_secret_2026';

let mongoServer;
let app;
let studentToken;
let studentUser;
let otherStudentToken;
let otherStudentUser;
let adminToken;
let adminUser;

describe('SmartCampus AI — Payment & Fee Verification Suite', () => {
  before(async () => {
    // Isolated In-Memory Database for Safe Non-Destructive Testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    app = require('../server');
    const { User, StudentProfile } = require('../models/CampusModels');

    // 1. Create Primary Student
    studentUser = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.student@smartcampus.edu',
      password: 'Password123!',
      role: 'student',
      department: 'BCA',
      studentId: 'STU-2026-BCA-001'
    });
    await StudentProfile.create({
      user: studentUser._id,
      rollNumber: 'BCA-2026-001',
      department: 'Computer Applications',
      course: 'BCA',
      semester: 5
    });

    // 2. Create Second Student (for Isolation Tests)
    otherStudentUser = await User.create({
      name: 'Priya Patel',
      email: 'priya.student@smartcampus.edu',
      password: 'Password123!',
      role: 'student',
      department: 'MCA',
      studentId: 'STU-2026-MCA-002'
    });

    // 3. Create Admin User
    adminUser = await User.create({
      name: 'Finance Admin',
      email: 'finance.admin@smartcampus.edu',
      password: 'Password123!',
      role: 'admin',
      department: 'Finance'
    });

    // Obtain JWT Tokens
    const jwt = require('jsonwebtoken');
    studentToken = jwt.sign(
      { id: studentUser._id, email: studentUser.email, role: 'student', name: studentUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    otherStudentToken = jwt.sign(
      { id: otherStudentUser._id, email: otherStudentUser.email, role: 'student', name: otherStudentUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: 'admin', name: adminUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // ============================================================
  // TEST A: STUDENT FEE DASHBOARD & AUTHORIZED CATEGORIES
  // ============================================================
  test('Test A: Student fee dashboard correctly calculates totals and supports required categories', async () => {
    const { FeeRecord } = require('../models/CampusModels');

    // Seed 6 authorized fee assessments representing university categories
    const categories = [
      { type: 'Academic Fees', amount: 45000, paid: 0 },
      { type: 'Hostel Fees', amount: 30000, paid: 15000 },
      { type: 'Transportation Fees', amount: 8000, paid: 8000 },
      { type: 'Debarred Fees', amount: 2500, paid: 0 },
      { type: 'Backlogs Fees', amount: 1500, paid: 0 },
      { type: 'Miscellaneous Fees', amount: 2000, paid: 0 }
    ];

    for (const cat of categories) {
      await FeeRecord.create({
        student: studentUser._id,
        feeType: cat.type,
        semester: 5,
        totalAmount: cat.amount,
        paidAmount: cat.paid,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    const res = await request(app)
      .get('/api/fees/my')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);

    // Independent calculation verification
    const expectedTotalBilled = 45000 + 30000 + 8000 + 2500 + 1500 + 2000; // 89000
    const expectedTotalPaid = 0 + 15000 + 8000 + 0 + 0 + 0; // 23000
    const expectedTotalBalance = expectedTotalBilled - expectedTotalPaid; // 66000

    assert.strictEqual(res.body.totalBilled, expectedTotalBilled);
    assert.strictEqual(res.body.totalPaid, expectedTotalPaid);
    assert.strictEqual(res.body.totalBalance, expectedTotalBalance);
    assert.strictEqual(res.body.fees.length, 6);

    // Verify all 6 categories present
    const feeTypes = res.body.fees.map((f) => f.feeType);
    assert.ok(feeTypes.includes('Academic Fees'));
    assert.ok(feeTypes.includes('Hostel Fees'));
    assert.ok(feeTypes.includes('Transportation Fees'));
    assert.ok(feeTypes.includes('Debarred Fees'));
    assert.ok(feeTypes.includes('Backlogs Fees'));
    assert.ok(feeTypes.includes('Miscellaneous Fees'));
  });

  // ============================================================
  // TEST B: PAYMENT-ORDER CREATION & TAMPER DEFENSE
  // ============================================================
  test('Test B: Payment order creation enforces student ownership, balance limits, and tamper rejection', async () => {
    const { FeeRecord, PaymentTransaction } = require('../models/CampusModels');

    const academicFee = await FeeRecord.findOne({ student: studentUser._id, feeType: 'Academic Fees' });
    assert.ok(academicFee);

    // 1. Attempt to create order for another student's fee -> Rejected 403
    const attackRes = await request(app)
      .post('/api/fees/order')
      .set('Authorization', `Bearer ${otherStudentToken}`)
      .send({ feeId: academicFee._id.toString() });

    assert.strictEqual(attackRes.statusCode, 403);
    assert.strictEqual(attackRes.body.success, false);
    assert.match(attackRes.body.message, /Access denied/);

    // 2. Student requests partial payment larger than balance -> Clamped to authoritative balance
    const validOrderRes = await request(app)
      .post('/api/fees/order')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        feeId: academicFee._id.toString(),
        partialAmount: 999999 // student attempts to tamper or overpay
      });

    assert.strictEqual(validOrderRes.statusCode, 200);
    assert.strictEqual(validOrderRes.body.success, true);
    assert.strictEqual(validOrderRes.body.amount, 45000); // Clamped to actual balance
    assert.strictEqual(validOrderRes.body.currency, 'INR');
    assert.ok(validOrderRes.body.orderId);
    assert.ok(validOrderRes.body.receiptNumber);

    // 3. Verify PaymentTransaction persisted in 'created' state
    const txn = await PaymentTransaction.findOne({ orderId: validOrderRes.body.orderId });
    assert.ok(txn);
    assert.strictEqual(txn.status, 'created');
    assert.strictEqual(txn.amount, 45000);
    assert.strictEqual(txn.student.toString(), studentUser._id.toString());
  });

  // ============================================================
  // TEST C: SIGNATURE AND TRANSACTION VERIFICATION
  // ============================================================
  test('Test C: Cryptographic HMAC signature verification accepts valid payment and rejects forgery', async () => {
    const { FeeRecord, PaymentTransaction } = require('../models/CampusModels');

    const debarredFee = await FeeRecord.findOne({ student: studentUser._id, feeType: 'Debarred Fees' });

    // 1. Create order
    const orderRes = await request(app)
      .post('/api/fees/order')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ feeId: debarredFee._id.toString() });

    assert.strictEqual(orderRes.statusCode, 200);
    const orderId = orderRes.body.orderId;
    const paymentId = 'pay_test_' + Date.now();

    // 2. Forged signature -> Rejected 400
    const forgedRes = await request(app)
      .post('/api/fees/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        orderId,
        paymentId,
        signature: 'invalid_forged_sha256_signature_hex'
      });

    assert.strictEqual(forgedRes.statusCode, 400);
    assert.strictEqual(forgedRes.body.success, false);
    assert.match(forgedRes.body.message, /signature verification failed/i);

    // Verify transaction marked as 'failed'
    const failedTxn = await PaymentTransaction.findOne({ orderId });
    assert.strictEqual(failedTxn.status, 'failed');

    // 3. Create fresh order for valid payment test
    const order2 = await request(app)
      .post('/api/fees/order')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ feeId: debarredFee._id.toString() });

    const validOrderId = order2.body.orderId;
    const validPaymentId = 'pay_test_valid_' + Date.now();

    // Compute genuine HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${validOrderId}|${validPaymentId}`);
    const genuineSignature = hmac.digest('hex');

    // Verify genuine signature
    const verifyRes = await request(app)
      .post('/api/fees/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        orderId: validOrderId,
        paymentId: validPaymentId,
        signature: genuineSignature
      });

    assert.strictEqual(verifyRes.statusCode, 200);
    assert.strictEqual(verifyRes.body.success, true);
    assert.strictEqual(verifyRes.body.transaction.status, 'captured');
    assert.strictEqual(verifyRes.body.fee.status, 'Paid');
    assert.strictEqual(verifyRes.body.fee.balanceAmount, 0);

    // 4. Repeated verification request -> Idempotent response without duplicate credit
    const replayRes = await request(app)
      .post('/api/fees/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        orderId: validOrderId,
        paymentId: validPaymentId,
        signature: genuineSignature
      });

    assert.strictEqual(replayRes.statusCode, 200);
    assert.strictEqual(replayRes.body.alreadyProcessed, true);
  });

  // ============================================================
  // TEST D: CORRECT BALANCE RECALCULATION & CONCESSION RECONCILIATION
  // ============================================================
  test('Test D: Balance recalculates accurately across concessions and partial payments', async () => {
    const { FeeRecord } = require('../models/CampusModels');

    // Create assessment: Assessed = ₹50,000, Concession = ₹5,000, Net due = ₹45,000
    const fee = await FeeRecord.create({
      student: studentUser._id,
      feeType: 'Academic Fees',
      semester: 6,
      totalAmount: 50000,
      concessionAmount: 5000,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    });

    assert.strictEqual(fee.balanceAmount, 45000);
    assert.strictEqual(fee.status, 'Pending');

    // 1. Partial payment of ₹20,000
    const order1 = await request(app)
      .post('/api/fees/order')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ feeId: fee._id.toString(), partialAmount: 20000 });

    const payId1 = 'pay_part_' + Date.now();
    const hmac1 = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac1.update(`${order1.body.orderId}|${payId1}`);

    const ver1 = await request(app)
      .post('/api/fees/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        orderId: order1.body.orderId,
        paymentId: payId1,
        signature: hmac1.digest('hex')
      });

    assert.strictEqual(ver1.statusCode, 200);
    assert.strictEqual(ver1.body.fee.paidAmount, 20000);
    assert.strictEqual(ver1.body.fee.balanceAmount, 25000);
    assert.strictEqual(ver1.body.fee.status, 'Partial');

    // 2. Final payment of remaining ₹25,000
    const order2 = await request(app)
      .post('/api/fees/order')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ feeId: fee._id.toString() });

    assert.strictEqual(order2.body.amount, 25000);
    const payId2 = 'pay_final_' + Date.now();
    const hmac2 = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac2.update(`${order2.body.orderId}|${payId2}`);

    const ver2 = await request(app)
      .post('/api/fees/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        orderId: order2.body.orderId,
        paymentId: payId2,
        signature: hmac2.digest('hex')
      });

    assert.strictEqual(ver2.statusCode, 200);
    assert.strictEqual(ver2.body.fee.paidAmount, 45000);
    assert.strictEqual(ver2.body.fee.balanceAmount, 0);
    assert.strictEqual(ver2.body.fee.status, 'Paid');
  });

  // ============================================================
  // TEST E: DUPLICATE WEBHOOK PROTECTION & IDEMPOTENCY
  // ============================================================
  test('Test E: Duplicate webhook replay delivers identical outcome without double credit', async () => {
    const { FeeRecord, PaymentTransaction } = require('../models/CampusModels');

    const backlogFee = await FeeRecord.findOne({ student: studentUser._id, feeType: 'Backlogs Fees' });

    // Create payment order
    const orderRes = await request(app)
      .post('/api/fees/order')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ feeId: backlogFee._id.toString() });

    const orderId = orderRes.body.orderId;
    const webhookEventId = 'evt_test_replay_' + Date.now();
    const mockPaymentId = 'pay_wh_' + Date.now();

    const webhookPayload = {
      event: 'payment.captured',
      event_id: webhookEventId,
      payload: {
        payment: {
          entity: {
            id: mockPaymentId,
            order_id: orderId,
            amount: 150000,
            currency: 'INR',
            status: 'captured'
          }
        }
      }
    };

    const payloadString = JSON.stringify(webhookPayload);
    const rawBodyBuffer = Buffer.from(payloadString, 'utf8');
    const webhookSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBodyBuffer)
      .digest('hex');

    // 1. Deliver Webhook First Time
    const wh1 = await request(app)
      .post('/api/fees/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', webhookSignature)
      .set('x-razorpay-event-id', webhookEventId)
      .send(payloadString);

    assert.strictEqual(wh1.statusCode, 200);
    assert.strictEqual(wh1.body.result.success, true);

    // Verify balance reduced once
    const updatedFee = await FeeRecord.findById(backlogFee._id);
    assert.strictEqual(updatedFee.balanceAmount, 0);
    assert.strictEqual(updatedFee.paidAmount, 1500);

    // 2. Deliver Webhook Second Time (Duplicate Event Replay)
    const wh2 = await request(app)
      .post('/api/fees/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', webhookSignature)
      .set('x-razorpay-event-id', webhookEventId)
      .send(payloadString);

    assert.strictEqual(wh2.statusCode, 200);
    assert.strictEqual(wh2.body.result.duplicate, true);

    // Verify balance was NOT deducted again
    const finalFee = await FeeRecord.findById(backlogFee._id);
    assert.strictEqual(finalFee.balanceAmount, 0);
    assert.strictEqual(finalFee.paidAmount, 1500);
  });

  // ============================================================
  // TEST F: DOWNLOADABLE PDF RECEIPT & TAMPER PROTECTION
  // ============================================================
  test('Test F: Confirmed payment generates valid PDF receipt; unpaid and unauthorized access rejected', async () => {
    const { FeeRecord } = require('../models/CampusModels');

    const paidFee = await FeeRecord.findOne({ student: studentUser._id, status: 'Paid' });
    assert.ok(paidFee);

    // 1. Authorized student downloads own receipt -> HTTP 200 with application/pdf
    const receiptRes = await request(app)
      .get(`/api/fees/${paidFee._id}/receipt`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(receiptRes.statusCode, 200);
    assert.strictEqual(receiptRes.headers['content-type'], 'application/pdf');
    assert.ok(receiptRes.headers['content-disposition'].includes('.pdf'));

    // Verify genuine PDF 1.4 binary structure
    const pdfContent = receiptRes.body.toString('latin1');
    assert.ok(pdfContent.startsWith('%PDF-1.4'));
    assert.ok(pdfContent.includes('SMARTCAMPUS UNIVERSITY'));
    assert.ok(pdfContent.includes('OFFICIAL ACADEMIC FEE PAYMENT RECEIPT'));
    assert.ok(pdfContent.includes('Rohan Sharma')); // Student name verified

    // 2. Unauthorized student attempts to download another student's receipt -> HTTP 403
    const attackRes = await request(app)
      .get(`/api/fees/${paidFee._id}/receipt`)
      .set('Authorization', `Bearer ${otherStudentToken}`);

    assert.strictEqual(attackRes.statusCode, 403);
    assert.match(attackRes.body.message, /Access denied/);

    // 3. Attempt to download receipt for unpaid fee -> HTTP 400
    const unpaidFee = await FeeRecord.findOne({ student: studentUser._id, status: 'Pending' });
    if (unpaidFee) {
      const unpaidRes = await request(app)
        .get(`/api/fees/${unpaidFee._id}/receipt`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(unpaidRes.statusCode, 400);
      assert.match(unpaidRes.body.message, /unpaid fee/i);
    }
  });

  // ============================================================
  // TEST G: ROLE-BASED ACCESS CONTROL & ISOLATION
  // ============================================================
  test('Test G: Students cannot assess fees, alter status, or view other students accounts', async () => {
    // 1. Student attempts to create an assessment -> HTTP 403
    const createRes = await request(app)
      .post('/api/fees')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        studentId: studentUser._id.toString(),
        feeType: 'Academic Fees',
        totalAmount: 1000,
        dueDate: new Date().toISOString()
      });

    assert.strictEqual(createRes.statusCode, 403);

    // 2. Student attempts to manually mark payment -> HTTP 403
    const payRes = await request(app)
      .patch(`/api/fees/${studentUser._id}/pay`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ paymentAmount: 5000 });

    assert.strictEqual(payRes.statusCode, 403);

    // 3. Admin can access all fees overview
    const adminRes = await request(app)
      .get('/api/fees')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(adminRes.statusCode, 200);
    assert.ok(adminRes.body.totalReceivable >= 0);
  });

  // ============================================================
  // TEST H: ROUTE CONTRACT & REGISTRATION VERIFICATION
  // ============================================================
  test('Test H: Route contract verification: /me/payments, /order, aliases, and unauthenticated guards', async () => {
    const { FeeRecord } = require('../models/CampusModels');

    // 1. Unauthenticated requests are rejected with HTTP 401 (never 404)
    const unauthTx = await request(app).get('/api/fees/me/payments');
    assert.strictEqual(unauthTx.statusCode, 401);
    assert.strictEqual(unauthTx.body.success, false);

    const unauthOrder = await request(app).post('/api/fees/order');
    assert.strictEqual(unauthOrder.statusCode, 401);
    assert.strictEqual(unauthOrder.body.success, false);

    // 2. Authenticated student receives only their own transactions
    const authTx = await request(app)
      .get('/api/fees/me/payments')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(authTx.statusCode, 200);
    assert.strictEqual(authTx.body.success, true);
    assert.ok(Array.isArray(authTx.body.transactions));
    assert.ok(authTx.body.transactions.length > 0);
    // Verify all returned transactions belong to studentUser
    for (const tx of authTx.body.transactions) {
      assert.strictEqual(tx.student.toString(), studentUser._id.toString());
    }

    // 3. Alternate alias GET /api/fees/payments resolves identically
    const aliasTx = await request(app)
      .get('/api/fees/payments')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(aliasTx.statusCode, 200);
    assert.strictEqual(aliasTx.body.success, true);
    assert.strictEqual(aliasTx.body.count, authTx.body.count);

    // 4. Other student receives clean empty transaction list (no IDOR leakage)
    const otherTx = await request(app)
      .get('/api/fees/me/payments')
      .set('Authorization', `Bearer ${otherStudentToken}`);

    assert.strictEqual(otherTx.statusCode, 200);
    assert.strictEqual(otherTx.body.success, true);
    assert.strictEqual(otherTx.body.count, 0);
    assert.deepStrictEqual(otherTx.body.transactions, []);

    // 5. POST /api/fees/order validates feeId and returns clear 400
    const missingFeeId = await request(app)
      .post('/api/fees/order')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});

    assert.strictEqual(missingFeeId.statusCode, 400);
    assert.match(missingFeeId.body.message, /feeId is required/i);

    // 6. Aliases POST /create-order and POST /me/payments/create-order resolve correctly
    const aliasOrder1 = await request(app)
      .post('/api/fees/create-order')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});
    assert.strictEqual(aliasOrder1.statusCode, 400);

    const aliasOrder2 = await request(app)
      .post('/api/fees/me/payments/create-order')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});
    assert.strictEqual(aliasOrder2.statusCode, 400);

    // 7. Successful order creation with valid feeId
    const targetFee = await FeeRecord.findOne({ student: studentUser._id, balanceAmount: { $gt: 0 } });
    if (targetFee) {
      const validOrder = await request(app)
        .post('/api/fees/order')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ feeId: targetFee._id.toString() });

      assert.strictEqual(validOrder.statusCode, 200);
      assert.strictEqual(validOrder.body.success, true);
      assert.ok(validOrder.body.orderId);
      assert.ok(validOrder.body.amountPaise > 0);
    }
  });

  after(async () => {
    await closeDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
});


