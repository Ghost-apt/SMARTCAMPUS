const { FeeRecord, User } = require('../models/CampusModels');

// @desc    Get current student's fee records
// @route   GET /api/fees/my
// @access  Private / Student, Admin
const getMyFees = async (req, res, next) => {
  try {
    const studentId = req.query.studentId && req.user.role === 'admin'
      ? req.query.studentId
      : req.user.id;

    const fees = await FeeRecord.find({ student: studentId }).sort({ dueDate: 1 });

    const totalBilled = fees.reduce((acc, f) => acc + (Number(f.totalAmount) || 0), 0);
    const totalPaid = fees.reduce((acc, f) => acc + (Number(f.paidAmount) || 0), 0);
    const totalBalance = Math.max(0, totalBilled - totalPaid);

    res.status(200).json({
      success: true,
      totalBilled,
      totalPaid,
      totalBalance,
      fees
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

module.exports = {
  getMyFees,
  getAllFees,
  createFeeRecord,
  recordPayment,
  getFeeStructure
};

