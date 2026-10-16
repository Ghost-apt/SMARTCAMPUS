const mongoose = require('mongoose');

// ==========================================
// FEE RECORD SCHEMA & MODEL
// ==========================================
const feeRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    feeType: {
      type: String,
      required: true,
      enum: ['Tuition Fee', 'Examination Fee', 'Lab Fee', 'Library Fee', 'Hostel Fee', 'Other'],
      default: 'Tuition Fee'
    },
    semester: {
      type: Number,
      default: 5
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    balanceAmount: {
      type: Number,
      default: 0
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending', 'Overdue'],
      default: 'Pending'
    },
    receiptNumber: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

feeRecordSchema.index({ student: 1, academicYear: 1, semester: 1 });
feeRecordSchema.index({ status: 1 });

// Pre-save hook: compute balanceAmount & update status accordingly
feeRecordSchema.pre('save', async function () {
  this.balanceAmount = Math.max(0, this.totalAmount - (this.paidAmount || 0));
  if (this.balanceAmount === 0) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  } else {
    this.status = 'Pending';
  }
});

const FeeRecord = mongoose.models.FeeRecord || mongoose.model('FeeRecord', feeRecordSchema);

module.exports = FeeRecord;
