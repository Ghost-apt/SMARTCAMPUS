const mongoose = require('mongoose');

// ==========================================
// PAYMENT TRANSACTION SCHEMA & MODEL
// ==========================================
const paymentTransactionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    feeRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeRecord',
      required: true,
      index: true
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    paymentId: {
      type: String,
      default: null,
      trim: true
    },
    signature: {
      type: String,
      default: null,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Payment amount must be greater than zero']
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true
    },
    paymentMethod: {
      type: String,
      default: 'razorpay_checkout'
    },
    paymentChannel: {
      type: String,
      enum: ['ONLINE', 'OFFLINE'],
      default: 'ONLINE',
      index: true
    },
    offlineReference: {
      type: String,
      default: '',
      trim: true
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recordedByName: {
      type: String,
      default: ''
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    academicYear: {
      type: String,
      default: '2026-2027',
      trim: true
    },
    semester: {
      type: Number,
      default: 5
    },
    feeType: {
      type: String,
      default: 'Academic Fees'
    },
    notes: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    webhookEventsProcessed: {
      type: [String],
      default: []
    },
    failureReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

paymentTransactionSchema.index({ student: 1, createdAt: -1 });
paymentTransactionSchema.index({ feeRecord: 1, status: 1 });

const PaymentTransaction =
  mongoose.models.PaymentTransaction ||
  mongoose.model('PaymentTransaction', paymentTransactionSchema);

module.exports = PaymentTransaction;
