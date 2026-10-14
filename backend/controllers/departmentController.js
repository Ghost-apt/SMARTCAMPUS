const mongoose = require('mongoose');
const { Department, Course, User } = require('../models/CampusModels');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('headOfDepartment', 'name email');
    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (err) {
    next(err);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const deptCode = req.body.deptCode || req.body.departmentCode;
    const deptName = req.body.deptName || req.body.departmentName;
    const { description, headOfDepartment, contactEmail, buildingLocation } = req.body;
    if (!deptCode || !deptName) {
      return res.status(400).json({ success: false, message: 'Department code and name are required.' });
    }

    const validHod = headOfDepartment && mongoose.Types.ObjectId.isValid(headOfDepartment) ? headOfDepartment : null;

    const dept = await Department.create({
      deptCode: deptCode.toUpperCase().trim(),
      deptName: deptName.trim(),
      description,
      headOfDepartment: validHod,
      contactEmail,
      buildingLocation
    });

    res.status(201).json({ success: true, message: 'Department created successfully.', department: dept });
  } catch (err) {
    next(err);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found.' });
    res.status(200).json({ success: true, department: dept });
  } catch (err) {
    next(err);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found.' });
    res.status(200).json({ success: true, message: 'Department deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
