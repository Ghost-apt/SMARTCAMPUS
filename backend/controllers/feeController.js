const { FeeRecord, PaymentTransaction, StudentProfile, AuditLog, User } = require('../models/CampusModels');
const paymentService = require('../services/paymentService');

// @desc    Get current student's fee records & comprehensive summary
// @route   GET /api/fees/my, GET /api/fees/me/summary, GET /api/fees/me/assessments
// @access  Private / Student, Admin
const getMyFees = async (req, res, next) => {
  try {
    const studentId = req.query.studentId && req.user.role === 'admin'
      ? req.query.studentId
      : req.user.id;

    const filter = { student: studentId };
    if (req.query.semester && req.query.semester !== 'all') {
      filter.semester = Number(req.query.semester);
    }
    if (req.query.academicYear) {
      filter.academicYear = req.query.academicYear;
    }

    const fees = await FeeRecord.find(filter).sort({ semester: 1, dueDate: 1 });

    // Determine current student semester from StudentProfile or active fees
    let currentSemester = 5;
    try {
      const profile = await StudentProfile.findOne({ user: studentId });
      if (profile?.semester) {
        currentSemester = profile.semester;
      } else if (fees.length > 0) {
        currentSemester = Math.max(...fees.map((f) => Number(f.semester) || 1));
      }
    } catch (e) {}

    const now = new Date();
    const totalBilled = fees.reduce((acc, f) => acc + (Number(f.totalAmount) || 0), 0);
    const totalPaid = fees.reduce((acc, f) => acc + (Number(f.paidAmount) || 0), 0);
    const totalBalance = Math.max(0, totalBilled - totalPaid);
    const totalConcessions = fees.reduce((acc, f) => acc + (Number(f.concessionAmount) || 0), 0);

    const overdueAmount = fees
      .filter((f) => f.dueDate && new Date(f.dueDate) < now && (f.balanceAmount || 0) > 0)
      .reduce((acc, f) => acc + (Number(f.balanceAmount) || 0), 0);

    const currentSemesterOutstanding = fees
      .filter((f) => Number(f.semester) === currentSemester)
      .reduce((acc, f) => acc + (Number(f.balanceAmount) || 0), 0);

    const previousSemesterOutstanding = fees
      .filter((f) => Number(f.semester) < currentSemester)
      .reduce((acc, f) => acc + (Number(f.balanceAmount) || 0), 0);

    res.status(200).json({
      success: true,
      totalBilled,
      totalPaid,
      totalConcessions,
      totalBalance,
      overdueAmount,
      currentSemester,
      currentSemesterOutstanding,
      previousSemesterOutstanding,
      fees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get specific authorized fee assessment
// @route   GET /api/fees/me/assessments/:id
// @access  Private / Student, Admin
const getAssessmentById = async (req, res, next) => {
  try {
    const fee = await FeeRecord.findById(req.params.id).populate('student', 'name email studentId department');
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee assessment not found.' });
    }

    if (req.user.role !== 'admin' && fee.student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: You cannot view another student\'s assessment.' });
    }

    res.status(200).json({
      success: true,
      fee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current student's payment transactions history
// @route   GET /api/fees/me/payments
// @access  Private / Student, Admin
const getMyTransactions = async (req, res, next) => {
  try {
    const studentId = req.query.studentId && req.user.role === 'admin'
      ? req.query.studentId
      : req.user.id;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const total = await PaymentTransaction.countDocuments({ student: studentId });
    const transactions = await PaymentTransaction.find({ student: studentId })
      .populate('feeRecord', 'feeType semester academicYear totalAmount balanceAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      transactions: transactions || []
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get specific payment transaction
// @route   GET /api/fees/me/payments/:id
// @access  Private / Student, Admin
const getMyTransactionById = async (req, res, next) => {
  try {
    const transaction = await PaymentTransaction.findById(req.params.id)
      .populate('student', 'name email studentId department')
      .populate('feeRecord');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Payment transaction record not found.' });
    }

    if (req.user.role !== 'admin' && transaction.student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: You cannot view another student\'s transaction.' });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    List all fee records across university (Admin only)
// @route   GET /api/fees
// @access  Private / Admin
const getAllFees = async (req, res, next) => {
  try {
    const { status, feeType } = req.query;
    const query = {};
    if (status) query.status = status;
    if (feeType) query.feeType = feeType;

    const fees = await FeeRecord.find(query)
      .populate('student', 'name email studentId department')
      .sort({ dueDate: 1 });

    const totalReceivable = fees.reduce((acc, f) => acc + (Number(f.totalAmount) || 0), 0);
    const totalCollected = fees.reduce((acc, f) => acc + (Number(f.paidAmount) || 0), 0);
    const totalOutstanding = Math.max(0, totalReceivable - totalCollected);

    res.status(200).json({
      success: true,
      totalReceivable,
      totalCollected,
      totalOutstanding,
      count: fees.length,
      fees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new fee record (Admin only)
// @route   POST /api/fees
// @access  Private / Admin
const createFeeRecord = async (req, res, next) => {
  try {
    const { studentId, feeType, semester, totalAmount, paidAmount, dueDate, receiptNumber, remarks } = req.body;

    if (!studentId || !totalAmount || !dueDate) {
      return res.status(400).json({ success: false, message: 'studentId, totalAmount, and dueDate are required.' });
    }

    const fee = await FeeRecord.create({
      student: studentId,
      feeType: feeType || 'Tuition Fee',
      semester: semester || 5,
      totalAmount: parseFloat(totalAmount),
      paidAmount: parseFloat(paidAmount || 0),
      dueDate: new Date(dueDate),
      receiptNumber: receiptNumber || '',
      remarks: remarks || ''
    });

    res.status(201).json({ success: true, message: 'Fee record created successfully.', fee });
  } catch (err) {
    next(err);
  }
};

// @desc    Record fee payment/installment (Admin only)
// @route   PATCH /api/fees/:id/pay
// @access  Private / Admin
const recordPayment = async (req, res, next) => {
  try {
    const { paymentAmount, receiptNumber, remarks } = req.body;
    const fee = await FeeRecord.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found.' });

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'paymentAmount must be a positive number.' });
    }

    fee.paidAmount = Math.min(fee.totalAmount, (fee.paidAmount || 0) + amount);
    if (receiptNumber) fee.receiptNumber = receiptNumber;
    if (remarks) fee.remarks = remarks;

    await fee.save(); // triggers pre-save to recalculate balanceAmount & status

    res.status(200).json({
      success: true,
      message: `Payment of ₹${amount} recorded successfully.`,
      fee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get university course fee structure
// @route   GET /api/fees/structure
// @access  Private / Student, Faculty, Admin
const getFeeStructure = async (req, res, next) => {
  try {
    const courseCode = req.query.courseCode || 'BCA';
    const semester = Number(req.query.semester) || 5;

    // Standard university fee components strictly aligned with FeeRecord.feeType enum
    const feeStructure = [
      {
        feeType: 'Tuition Fee',
        componentName: 'Academic Tuition & Instruction Fee',
        amount: 45000,
        frequency: 'Per Semester',
        mandatory: true,
        category: 'Mandatory Tuition',
        description: 'Covers major credit lectures, professor mentorship, curriculum delivery, and ongoing internal continuous assessments.'
      },
      {
        feeType: 'Examination Fee',
        componentName: 'University Examination & Assessment Fee',
        amount: 2500,
        frequency: 'Per Semester',
        mandatory: true,
        category: 'Mandatory Examination',
        description: 'Mid-term evaluations, semester terminal examinations, central grading, and UGC 10-point GPA transcript generation.'
      },
      {
        feeType: 'Lab Fee',
        componentName: 'Computer Science Lab & Cloud Sandbox',
        amount: 3500,
        frequency: 'Per Semester',
        mandatory: true,
        category: 'Laboratory & Compute',
        description: 'Access to high-performance labs, Docker container sandboxes, AI GPU compute instances, and development workstations.'
      },
      {
        feeType: 'Library Fee',
        componentName: 'Library & Digital E-Resource Access',
        amount: 1500,
        frequency: 'Per Semester',
        mandatory: true,
        category: 'Library & Subscriptions',
        description: 'Central university library borrowing, IEEE Xplore digital library access, ACM subscriptions, and research databases.'
      },
      {
        feeType: 'Hostel Fee',
        componentName: 'Campus Residential Hostel & Dining (Optional)',
        amount: 30000,
        frequency: 'Per Semester (Optional)',
        mandatory: false,
        category: 'Residential & Boarding',
        description: 'Air-conditioned double-sharing room, mess dining facilities, high-speed Wi-Fi, and 24/7 power backup.'
      },
      {
        feeType: 'Other',
        componentName: 'Student Welfare, Sports & Campus Infrastructure',
        amount: 1500,
        frequency: 'Per Academic Year',
        mandatory: true,
        category: 'Institutional Development',
        description: 'University sports complex facilities, annual technical symposiums, student health insurance, and campus maintenance.'
      }
    ];

    const totalMandatorySemester = feeStructure
      .filter((f) => f.mandatory && f.frequency.includes('Semester'))
      .reduce((sum, f) => sum + f.amount, 0);

    const totalAnnualMandatory = feeStructure
      .filter((f) => f.mandatory)
      .reduce((sum, f) => sum + (f.frequency.includes('Semester') ? f.amount * 2 : f.amount), 0);

    res.status(200).json({
      success: true,
      courseCode,
      courseName: 'Bachelor of Computer Applications (BCA)',
      semester,
      academicYear: '2026-2027',
      totalMandatorySemester,
      totalAnnualMandatory,
      feeStructure,
      paymentSchedule: [
        {
          milestone: 'Semester Enrollment & Class Allotment',
          dueDate: '2026-08-30',
          percentage: '80%',
          amount: Math.round(totalMandatorySemester * 0.8),
          requirement: 'Mandatory for timetable release & classroom portal access'
        },
        {
          milestone: 'Mid-Semester Examination Clearance',
          dueDate: '2026-10-28',
          percentage: '20%',
          amount: Math.round(totalMandatorySemester * 0.2),
          requirement: 'Mandatory before examination hall ticket issuance'
        }
      ],
      bankDetails: {
        accountName: 'SmartCampus University Central Finance',
        bankName: 'State Bank of India (Campus Branch)',
        accountNumber: '3948201948201',
        ifsc: 'SBIN0004921',
        branch: 'University Academic Block, Sector 62',
        upiId: 'fees@smartcampus.edu'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Initiate Razorpay payment order for student fee record
// @route   POST /api/fees/order
// @access  Private / Student, Admin
const createPaymentOrder = async (req, res, next) => {
  try {
    const { feeId, partialAmount, amount } = req.body;
    const studentId = req.user.id;

    if (!feeId) {
      return res.status(400).json({ success: false, message: 'feeId is required to generate payment order.' });
    }

    const orderData = await paymentService.createOrder({
      feeId,
      studentId,
      partialAmount: partialAmount !== undefined ? partialAmount : amount
    });

    res.status(200).json({
      success: true,
      message: 'Razorpay payment order generated successfully.',
      ...orderData
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// @desc    Verify Razorpay cryptographic payment signature and credit balance
// @route   POST /api/fees/verify
// @access  Private / Student, Admin
const verifyPayment = async (req, res, next) => {
  try {
    const orderId = req.body.orderId || req.body.razorpay_order_id;
    const paymentId = req.body.paymentId || req.body.razorpay_payment_id;
    const signature = req.body.signature || req.body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'orderId, paymentId, and signature are required for payment verification.'
      });
    }

    const result = await paymentService.verifyAndCapturePayment({
      orderId,
      paymentId,
      signature
    });

    res.status(200).json({
      success: true,
      message: result.message,
      alreadyProcessed: result.alreadyProcessed,
      transaction: result.transaction,
      fee: result.fee
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// @desc    Handle incoming Razorpay webhooks with raw body HMAC verification
// @route   POST /api/fees/webhook
// @access  Public (Signature authenticated)
const handleWebhook = async (req, res, next) => {
  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const signature = req.headers['x-razorpay-signature'];
    const eventHeaderId = req.headers['x-razorpay-event-id'];

    const result = await paymentService.processWebhook({
      rawBody,
      signature,
      eventHeaderId
    });

    res.status(200).json({
      success: true,
      result
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// @desc    Download official generated PDF receipt for fee payment
// @route   GET /api/fees/:id/receipt
// @access  Private / Student, Admin
const downloadReceipt = async (req, res, next) => {
  try {
    const feeId = req.params.id;
    const studentId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const { pdfBuffer, filename } = await paymentService.generateFeeReceiptPdf({
      feeId,
      studentId,
      isAdmin
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// @desc    Apply financial adjustment or concession to fee record (Admin only)
// @route   PATCH /api/fees/:id/adjust
// @access  Private / Admin
const adjustFeeRecord = async (req, res, next) => {
  try {
    const { concessionAmount, totalAmount, dueDate, remarks, reason, lateFee } = req.body;
    const fee = await FeeRecord.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found.' });

    const oldTotal = fee.totalAmount;
    const oldConcession = fee.concessionAmount || 0;
    const oldLate = fee.lateFee || 0;

    if (concessionAmount !== undefined) fee.concessionAmount = Math.max(0, parseFloat(concessionAmount));
    if (totalAmount !== undefined) fee.totalAmount = Math.max(0, parseFloat(totalAmount));
    if (lateFee !== undefined) fee.lateFee = Math.max(0, parseFloat(lateFee));
    if (dueDate) fee.dueDate = new Date(dueDate);
    if (remarks) fee.remarks = remarks;

    await fee.save();

    // Financial Audit Log entry
    try {
      await AuditLog.create({
        actor: req.user.id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: 'FEE_ASSESSMENT_ADJUSTED',
        resourceType: 'FeeRecord',
        resourceId: fee._id.toString(),
        details: {
          feeType: fee.feeType,
          student: fee.student,
          oldTotal,
          newTotal: fee.totalAmount,
          oldConcession,
          newConcession: fee.concessionAmount,
          oldLate,
          newLate: fee.lateFee,
          reason: reason || 'Administrative fee adjustment'
        },
        ipAddress: req.ip
      });
    } catch (auditErr) {
      console.warn('AuditLog recording skipped:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Fee record adjusted successfully.',
      fee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    List all university payment transactions (Admin only)
// @route   GET /api/fees/transactions
// @access  Private / Admin
const getAllTransactions = async (req, res, next) => {
  try {
    const { status, feeType, studentId, orderId, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (feeType) query.feeType = feeType;
    if (studentId) query.student = studentId;
    if (orderId) query.orderId = orderId;

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const transactions = await PaymentTransaction.find(query)
      .populate('student', 'name email studentId department')
      .populate('feeRecord', 'feeType semester totalAmount balanceAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PaymentTransaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      transactions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get university-wide financial overview & metrics (Admin only)
// @route   GET /api/fees/admin/summary
// @access  Private / Admin
const getAdminFinanceSummary = async (req, res, next) => {
  try {
    const fees = await FeeRecord.find({});
    const transactions = await PaymentTransaction.find({});

    const totalAssessed = fees.reduce((sum, f) => sum + (Number(f.totalAmount) || 0), 0);
    const totalCollected = fees.reduce((sum, f) => sum + (Number(f.paidAmount) || 0), 0);
    const totalOutstanding = fees.reduce((sum, f) => sum + (Number(f.balanceAmount) || 0), 0);
    const totalConcessions = fees.reduce((sum, f) => sum + (Number(f.concessionAmount) || 0), 0);

    const capturedTxns = transactions.filter((t) => t.status === 'captured');
    const onlineCollected = capturedTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const collectionRate = totalAssessed > 0 ? ((totalCollected / totalAssessed) * 100).toFixed(1) : '100.0';

    // Category breakdown
    const categoryStats = {};
    for (const f of fees) {
      if (!categoryStats[f.feeType]) {
        categoryStats[f.feeType] = { billed: 0, collected: 0, balance: 0, count: 0 };
      }
      categoryStats[f.feeType].billed += Number(f.totalAmount) || 0;
      categoryStats[f.feeType].collected += Number(f.paidAmount) || 0;
      categoryStats[f.feeType].balance += Number(f.balanceAmount) || 0;
      categoryStats[f.feeType].count += 1;
    }

    res.status(200).json({
      success: true,
      totalAssessed,
      totalCollected,
      totalOutstanding,
      totalConcessions,
      onlineCollected,
      collectionRate: parseFloat(collectionRate),
      totalFeeRecords: fees.length,
      totalTransactions: transactions.length,
      capturedTransactions: capturedTxns.length,
      categoryStats
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyFees,
  getAssessmentById,
  getMyTransactions,
  getMyTransactionById,
  getAllFees,
  createFeeRecord,
  adjustFeeRecord,
  getAllTransactions,
  getAdminFinanceSummary,
  recordPayment,
  getFeeStructure,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  downloadReceipt
};


