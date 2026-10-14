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

    const totalBilled = fees.reduce((acc, f) => acc + f.totalAmount, 0);
    const totalPaid = fees.reduce((acc, f) => acc + f.paidAmount, 0);
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

    const totalReceivable = fees.reduce((acc, f) => acc + f.totalAmount, 0);
    const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
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

module.exports = {
  getMyFees,
  getAllFees,
  createFeeRecord,
  recordPayment
};

