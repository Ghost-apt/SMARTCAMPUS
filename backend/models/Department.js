const mongoose = require('mongoose');

// ==========================================
// DEPARTMENT SCHEMA & MODEL
// ==========================================
const departmentSchema = new mongoose.Schema(
  {
    deptCode: {
      type: String,
      required: [true, 'Department code is required (e.g. CA, CSE)'],
      unique: true,
      trim: true,
      uppercase: true
    },
    deptName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactEmail: {
      type: String,
      default: ''
    },
    buildingLocation: {
      type: String,
      default: 'Academic Block A'
    }
  },
  {
    timestamps: true
  }
);

const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

module.exports = Department;
