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
      enum: [
        'Registration Fee',
        'Registration Fees',
        'Tuition Fee',
        'Examination Fee',
        'Lab Fee',
        'Library Fee',
        'Hostel Fee',
        'Hostel Fees',
        'Other',
        'Academic Fees',
        'Academic Fee',
        'Debarred Fees',
        'Debarred Fee',
        'Transportation Fees',
        'Transportation Fee',
        'Transport Fee',
        'Backlogs Fees',
        'Backlog Fee',
        'Miscellaneous Fees',
        'Miscellaneous Fee'
      ],
      default: 'Academic Fees'
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
    semesterName: {
      type: String,
      default: ''
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    concessionAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    offlinePaidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    onlinePaidAmount: {
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
    course: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure'
    },
    feeStructureVersion: {
      type: Number,
      default: 1
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
  const concession = Number(this.concessionAmount) || 0;
  const late = Number(this.lateFee) || 0;
  const netPayable = Math.max(0, this.totalAmount + late - concession);
  this.balanceAmount = Math.max(0, netPayable - (this.paidAmount || 0));
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
