const { FeeStructure, Course, Department, FeeRecord, User, AuditLog, Notification } = require('../models/CampusModels');

/**
 * @desc    List all fee structures with filtering & search
 * @route   GET /api/fees/structures
 * @access  Private / Admin, Faculty, Student
 */
const getFeeStructures = async (req, res, next) => {
  try {
    const { course, department, academicYear, status, semester } = req.query;
    const query = {};

    if (course && course !== 'all') {
      query.course = course.toUpperCase();
    }
    if (department && department !== 'all') {
      query.department = department;
    }
    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }
    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }
    if (semester && semester !== 'all') {
      query.semesters = Number(semester);
    }

    // Students only see PUBLISHED fee structures
    if (req.user && req.user.role === 'student') {
      query.status = 'PUBLISHED';
    }

    const structures = await FeeStructure.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role')
      .populate('publishedBy', 'name email role');

    res.status(200).json({
      success: true,
      count: structures.length,
      structures
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single fee structure by ID
 * @route   GET /api/fees/structures/:id
 * @access  Private / Admin, Faculty, Student
 */
const getFeeStructureById = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('publishedBy', 'name email role')
      .populate('previousVersionId');

    if (!structure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found.' });
    }

    // Students cannot view draft structures
    if (req.user && req.user.role === 'student' && structure.status !== 'PUBLISHED') {
      return res.status(403).json({ success: false, message: 'Access denied: Structure is not published.' });
    }

    res.status(200).json({
      success: true,
      structure
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new fee structure
 * @route   POST /api/fees/structures
 * @access  Private / Admin
 */
const createFeeStructure = async (req, res, next) => {
  try {
    const {
      name,
      course,
      courseName,
      department,
      academicYear,
      semesters,
      cohort,
      currency,
      categories,
      description,
      status,
      effectiveDate
    } = req.body;

    if (!name || !course) {
      return res.status(400).json({ success: false, message: 'Structure name and course are required.' });
    }

    // Validate categories if provided
    const validCategories = Array.isArray(categories)
      ? categories.map((c) => ({
          feeType: c.feeType || 'Academic Fees',
          categoryName: c.categoryName || c.feeType || 'Academic Fee Component',
          amount: Math.max(0, parseFloat(c.amount) || 0),
          semester: Number(c.semester) || 1,
          frequency: c.frequency || 'PER_SEMESTER',
          mandatory: c.mandatory !== undefined ? c.mandatory : true,
          dueDate: c.dueDate ? new Date(c.dueDate) : undefined,
          description: c.description || ''
        }))
      : [];

    const newStatus = status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

    const structure = new FeeStructure({
      name: name.trim(),
      course: course.trim().toUpperCase(),
      courseName: courseName ? courseName.trim() : `${course.trim().toUpperCase()} Program`,
      department: department ? department.trim() : 'Computer Applications',
      academicYear: academicYear ? academicYear.trim() : '2026-2027',
      semesters: Array.isArray(semesters) && semesters.length > 0 ? semesters.map(Number) : [1, 2, 3, 4, 5, 6],
      cohort: cohort ? cohort.trim() : '2026-2029',
      currency: currency || 'INR',
      status: newStatus,
      version: 1,
      categories: validCategories,
      description: description ? description.trim() : '',
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      createdBy: req.user.id,
      createdByName: req.user.name || 'Administrator',
      publishedBy: newStatus === 'PUBLISHED' ? req.user.id : undefined,
      publishedByName: newStatus === 'PUBLISHED' ? (req.user.name || 'Administrator') : undefined,
      publishedAt: newStatus === 'PUBLISHED' ? new Date() : undefined
    });

    await structure.save();

    // Audit logging
    await AuditLog.create({
      actor: req.user.id,
      actorName: req.user.name || 'Administrator',
      actorRole: req.user.role || 'admin',
      action: 'FEE_STRUCTURE_CREATED',
      resourceType: 'FeeStructure',
      resourceId: structure._id.toString(),
      details: {
        name: structure.name,
        course: structure.course,
        academicYear: structure.academicYear,
        status: structure.status
      },
      ipAddress: req.ip
    }).catch((e) => console.warn('AuditLog note:', e.message));

    res.status(201).json({
      success: true,
      message: `Fee structure '${structure.name}' created successfully.`,
      structure
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Edit an existing fee structure (updates draft or creates new version if published)
 * @route   PUT /api/fees/structures/:id, PATCH /api/fees/structures/:id
 * @access  Private / Admin
 */
const updateFeeStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found.' });
    }

    const {
      name,
      course,
      courseName,
      department,
      academicYear,
      semesters,
      cohort,
      currency,
      categories,
      description,
      status,
      effectiveDate,
      createNewVersion
    } = req.body;

    const validCategories = Array.isArray(categories)
      ? categories.map((c) => ({
          feeType: c.feeType || 'Academic Fees',
          categoryName: c.categoryName || c.feeType || 'Fee Component',
          amount: Math.max(0, parseFloat(c.amount) || 0),
          semester: Number(c.semester) || 1,
          frequency: c.frequency || 'PER_SEMESTER',
          mandatory: c.mandatory !== undefined ? c.mandatory : true,
          dueDate: c.dueDate ? new Date(c.dueDate) : undefined,
          description: c.description || ''
        }))
      : undefined;

    // Financial Versioning Guard: If structure is already PUBLISHED, editing creates a new version
    // to preserve historical accuracy of existing invoices and student payments!
    if (structure.status === 'PUBLISHED' || createNewVersion) {
      const nextVersion = (structure.version || 1) + 1;
      const newVersionStructure = new FeeStructure({
        name: name ? name.trim() : structure.name,
        course: course ? course.trim().toUpperCase() : structure.course,
        courseName: courseName ? courseName.trim() : structure.courseName,
        department: department ? department.trim() : structure.department,
        academicYear: academicYear ? academicYear.trim() : structure.academicYear,
        semesters: Array.isArray(semesters) ? semesters.map(Number) : structure.semesters,
        cohort: cohort ? cohort.trim() : structure.cohort,
        currency: currency || structure.currency,
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        version: nextVersion,
        categories: validCategories || structure.categories,
        description: description !== undefined ? description : structure.description,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        createdBy: req.user.id,
        createdByName: req.user.name || 'Administrator',
        publishedBy: status === 'PUBLISHED' ? req.user.id : undefined,
        publishedByName: status === 'PUBLISHED' ? (req.user.name || 'Administrator') : undefined,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
        previousVersionId: structure._id
      });

      await newVersionStructure.save();

      // Audit Log for versioned update
      await AuditLog.create({
        actor: req.user.id,
        actorName: req.user.name || 'Administrator',
        actorRole: req.user.role || 'admin',
        action: 'FEE_STRUCTURE_VERSION_CREATED',
        resourceType: 'FeeStructure',
        resourceId: newVersionStructure._id.toString(),
        details: {
          previousId: structure._id.toString(),
          version: nextVersion,
          course: newVersionStructure.course
        },
        ipAddress: req.ip
      }).catch((e) => console.warn('AuditLog note:', e.message));

      return res.status(200).json({
        success: true,
        message: `Published structure updated as new Version ${nextVersion}. Historical assessments preserved.`,
        isNewVersion: true,
        structure: newVersionStructure
      });
    }

    // Direct update for DRAFT structure
    if (name) structure.name = name.trim();
    if (course) structure.course = course.trim().toUpperCase();
    if (courseName) structure.courseName = courseName.trim();
    if (department) structure.department = department.trim();
    if (academicYear) structure.academicYear = academicYear.trim();
    if (Array.isArray(semesters)) structure.semesters = semesters.map(Number);
    if (cohort) structure.cohort = cohort.trim();
    if (currency) structure.currency = currency;
    if (validCategories) structure.categories = validCategories;
    if (description !== undefined) structure.description = description.trim();
    if (effectiveDate) structure.effectiveDate = new Date(effectiveDate);
    if (status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      structure.status = status;
      if (status === 'PUBLISHED') {
        structure.publishedBy = req.user.id;
        structure.publishedByName = req.user.name || 'Administrator';
        structure.publishedAt = new Date();
      }
    }

    await structure.save();

    await AuditLog.create({
      actor: req.user.id,
      actorName: req.user.name || 'Administrator',
      actorRole: req.user.role || 'admin',
      action: 'FEE_STRUCTURE_UPDATED',
      resourceType: 'FeeStructure',
      resourceId: structure._id.toString(),
      details: { name: structure.name, status: structure.status },
      ipAddress: req.ip
    }).catch((e) => console.warn('AuditLog note:', e.message));

    res.status(200).json({
      success: true,
      message: 'Fee structure updated successfully.',
      isNewVersion: false,
      structure
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Publish a fee structure
 * @route   POST /api/fees/structures/:id/publish
 * @access  Private / Admin
 */
const publishFeeStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found.' });
    }

    if (!structure.categories || structure.categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish a fee structure with zero fee categories.'
      });
    }

    // Verify all category amounts are nonnegative
    const hasInvalid = structure.categories.some((c) => Number(c.amount) < 0 || isNaN(Number(c.amount)));
    if (hasInvalid) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish fee structure with negative or invalid amounts.'
      });
    }

    // Archive any other currently PUBLISHED structure for the same course and academic year
    await FeeStructure.updateMany(
      {
        course: structure.course,
        academicYear: structure.academicYear,
        status: 'PUBLISHED',
        _id: { $ne: structure._id }
      },
      {
        $set: { status: 'ARCHIVED' }
      }
    );

    structure.status = 'PUBLISHED';
    structure.publishedBy = req.user.id;
    structure.publishedByName = req.user.name || 'Administrator';
    structure.publishedAt = new Date();
    await structure.save();

    await AuditLog.create({
      actor: req.user.id,
      actorName: req.user.name || 'Administrator',
      actorRole: req.user.role || 'admin',
      action: 'FEE_STRUCTURE_PUBLISHED',
      resourceType: 'FeeStructure',
      resourceId: structure._id.toString(),
      details: {
        course: structure.course,
        academicYear: structure.academicYear,
        version: structure.version
      },
      ipAddress: req.ip
    }).catch((e) => console.warn('AuditLog note:', e.message));

    res.status(200).json({
      success: true,
      message: `Fee structure '${structure.name}' is now active and published for ${structure.course}.`,
      structure
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get version history of a fee structure
 * @route   GET /api/fees/structures/:id/versions
 * @access  Private / Admin
 */
const getFeeStructureVersions = async (req, res, next) => {
  try {
    const current = await FeeStructure.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Fee structure not found.' });
    }

    const versions = await FeeStructure.find({
      course: current.course,
      academicYear: current.academicYear
    })
      .sort({ version: -1 })
      .populate('createdBy', 'name email role')
      .populate('publishedBy', 'name email role');

    res.status(200).json({
      success: true,
      currentVersion: current.version,
      count: versions.length,
      versions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk / Cohort assign published fee structure to enrolled students
 * @route   POST /api/fees/structures/:id/assign
 * @access  Private / Admin
 */
const assignFeeStructureToStudents = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found.' });
    }

    if (structure.status !== 'PUBLISHED') {
      return res.status(400).json({
        success: false,
        message: 'Only PUBLISHED fee structures can be assigned to students.'
      });
    }

    const { semester, targetStudentId } = req.body;
    const targetSemester = semester ? Number(semester) : 1;

    // Find eligible students (active students in matching department or course)
    let studentQuery = { role: 'student', accountStatus: 'active' };
    if (targetStudentId) {
      studentQuery._id = targetStudentId;
    } else {
      studentQuery.$or = [
        { department: structure.department },
        { department: structure.course },
        { studentId: { $regex: new RegExp(`^${structure.course}`, 'i') } }
      ];
    }

    const eligibleStudents = await User.find(studentQuery);
    let createdCount = 0;
    let existingCount = 0;

    for (const student of eligibleStudents) {
      for (const cat of structure.categories) {
        // Match semester or one-time / per-semester
        const applies = !cat.semester || cat.semester === targetSemester || cat.frequency === 'PER_SEMESTER' || cat.frequency === 'ONE_TIME';
        if (applies) {
          const existing = await FeeRecord.findOne({
            student: student._id,
            feeType: cat.feeType,
            semester: targetSemester,
            academicYear: structure.academicYear
          });

          if (!existing) {
            const due = cat.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await FeeRecord.create({
              student: student._id,
              feeType: cat.feeType,
              semester: targetSemester,
              academicYear: structure.academicYear,
              totalAmount: cat.amount,
              balanceAmount: cat.amount,
              paidAmount: 0,
              dueDate: due,
              status: 'Pending',
              course: structure.course,
              department: structure.department,
              feeStructure: structure._id,
              feeStructureVersion: structure.version,
              remarks: `Assessed from ${structure.name}`
            });
            createdCount++;
          } else {
            existingCount++;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Fee structure assigned to ${eligibleStudents.length} student(s). Created ${createdCount} new assessment(s). (${existingCount} previously existing preserved).`,
      studentsTargeted: eligibleStudents.length,
      assessmentsCreated: createdCount,
      existingPreserved: existingCount
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFeeStructures,
  getFeeStructureById,
  createFeeStructure,
  updateFeeStructure,
  publishFeeStructure,
  getFeeStructureVersions,
  assignFeeStructureToStudents
};
