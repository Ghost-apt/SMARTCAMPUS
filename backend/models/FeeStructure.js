const mongoose = require('mongoose');

// ==========================================
// FEE STRUCTURE SCHEMA & MODEL
// ==========================================
const feeCategorySubSchema = new mongoose.Schema(
  {
    feeType: {
      type: String,
      required: [true, 'Fee type is required'],
      trim: true,
      enum: [
        'Registration Fee',
        'Registration Fees',
        'Academic Fees',
        'Academic Fee',
        'Tuition Fee',
        'Examination Fee',
        'Lab Fee',
        'Library Fee',
        'Hostel Fee',
        'Hostel Fees',
        'Transportation Fees',
        'Transportation Fee',
        'Transport Fee',
        'Debarred Fees',
        'Debarred Fee',
        'Backlogs Fees',
        'Backlog Fee',
        'Miscellaneous Fees',
        'Miscellaneous Fee',
        'Other'
      ],
      default: 'Academic Fees'
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    semester: {
      type: Number,
      default: 1
    },
    frequency: {
      type: String,
      enum: ['ONE_TIME', 'PER_SEMESTER', 'PER_YEAR', 'ON_DEMAND'],
      default: 'PER_SEMESTER'
    },
    mandatory: {
      type: Boolean,
      default: true
    },
    dueDate: {
      type: Date
    },
    description: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: true }
);

const feeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fee structure name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters']
    },
    course: {
      type: String,
      required: [true, 'Course or program code is required (e.g. BCA, MCA)'],
      trim: true,
      uppercase: true,
      index: true
    },
    courseName: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: 'Computer Applications'
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      default: '2026-2027',
      index: true
    },
    semesters: {
      type: [Number],
      default: [1, 2, 3, 4, 5, 6]
    },
    cohort: {
      type: String,
      trim: true,
      default: '2026-2029'
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true
    },
    version: {
      type: Number,
      default: 1,
      min: 1
    },
    categories: [feeCategorySubSchema],
    totalMandatorySemester: {
      type: Number,
      default: 0
    },
    totalAnnual: {
      type: Number,
      default: 0
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdByName: {
      type: String,
      default: ''
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    publishedByName: {
      type: String,
      default: ''
    },
    publishedAt: {
      type: Date,
      default: null
    },
    previousVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save calculation hook for totals
feeStructureSchema.pre('save', async function () {
  if (this.categories && Array.isArray(this.categories)) {
    this.totalMandatorySemester = this.categories
      .filter((c) => c.mandatory && (c.frequency === 'PER_SEMESTER' || c.frequency === 'ONE_TIME'))
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    this.totalAnnual = this.categories
      .filter((c) => c.mandatory)
      .reduce((sum, c) => {
        const amt = Number(c.amount) || 0;
        if (c.frequency === 'PER_SEMESTER') return sum + amt * 2;
        return sum + amt;
      }, 0);
  }
});

feeStructureSchema.index({ course: 1, academicYear: 1, status: 1 });
feeStructureSchema.index({ status: 1, createdAt: -1 });

const FeeStructure = mongoose.models.FeeStructure || mongoose.model('FeeStructure', feeStructureSchema);

module.exports = FeeStructure;
