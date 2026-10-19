const {
  RegistrationRequest,
  User,
  StudentProfile,
  AuditLog,
  Notification,
  FeeStructure,
  FeeRecord
} = require('../models/CampusModels');

/**
 * @desc    Get all student registration requests with filtering, search & pagination
 * @route   GET /api/admin/registration-requests
 * @access  Private / Admin
 */
const getRegistrationRequests = async (req, res, next) => {
  try {
    const { status, department, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status.toUpperCase() !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registrationId: { $regex: search, $options: 'i' } },
        { assignedStudentId: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [total, requests, pendingCount] = await Promise.all([
      RegistrationRequest.countDocuments(query),
      RegistrationRequest.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('reviewedBy', 'name email role')
        .lean(),
      RegistrationRequest.countDocuments({ status: 'PENDING' })
    ]);

    res.status(200).json({
      success: true,
      pendingCount,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      requests
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single registration request details
 * @route   GET /api/admin/registration-requests/:id
 * @access  Private / Admin
 */
const getRegistrationRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await RegistrationRequest.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { registrationId: id.toUpperCase() }]
    })
      .select('-password')
      .populate('reviewedBy', 'name email role')
      .populate('user', 'name email studentId accountStatus approvalStatus createdAt');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Registration request not found.'
      });
    }

    res.status(200).json({
      success: true,
      request
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Approve a student registration request
 * @route   POST /api/admin/registration-requests/:id/approve
 * @access  Private / Admin
 */
const approveRegistrationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rollNumber, customStudentId, notes } = req.body;

    // 1. Fetch registration request
    const request = await RegistrationRequest.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { registrationId: id.toUpperCase() }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Registration request not found.'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Registration request cannot be approved because it is already ${request.status}.`
      });
    }

    // 2. Determine official Student ID / Roll Number
    let assignedId = customStudentId || rollNumber;
    if (!assignedId) {
      const year = new Date().getFullYear();
      const deptCode = (request.department || 'BCA').substring(0, 3).toUpperCase();
      const uniqueSuffix = Date.now().toString().slice(-4);
      assignedId = `${deptCode}-${year}-${uniqueSuffix}`;
    }

    // 3. Find or link User account
    let user = null;
    if (request.user) {
      user = await User.findById(request.user);
    }
    if (!user) {
      user = await User.findOne({ email: request.email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Underlying applicant user account could not be found.'
      });
    }

    // Check if another active user already has this studentId
    const existingWithId = await User.findOne({ studentId: assignedId, _id: { $ne: user._id } });
    if (existingWithId) {
      assignedId = `${assignedId}-${Date.now().toString().slice(-3)}`;
    }

    // 4. Activate User
    user.accountStatus = 'active';
    user.approvalStatus = 'APPROVED';
    user.studentId = assignedId;
    user.department = request.department || user.department;
    user.phone = request.phone || user.phone;
    user.registrationRequestId = request._id;
    await user.save();

    // 5. Ensure StudentProfile is created and linked
    let profile = await StudentProfile.findOne({ user: user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        user: user._id,
        rollNumber: assignedId,
        department: request.department || 'Computer Applications',
        course: request.course || 'BCA',
        semester: request.semester || 1,
        batch: `${new Date().getFullYear()}-${new Date().getFullYear() + 3}`
      }).catch((e) => {
        console.warn('StudentProfile creation note on approval:', e.message);
        return null;
      });
    } else {
      profile.rollNumber = assignedId;
      profile.department = request.department || profile.department;
      profile.course = request.course || profile.course;
      await profile.save().catch(() => {});
    }

    // 5.5. Auto-assign published fee structure assessments (if available for student course & semester)
    try {
      const studentCourse = (request.course || (profile && profile.course) || 'BCA').toUpperCase();
      const studentSemester = Number(request.semester || (profile && profile.semester) || 1);
      const studentAcademicYear = request.academicYear || '2026-2027';

      const publishedStructure = await FeeStructure.findOne({
        course: studentCourse,
        status: 'PUBLISHED'
      }).sort({ version: -1 });

      if (publishedStructure && publishedStructure.categories && publishedStructure.categories.length > 0) {
        for (const cat of publishedStructure.categories) {
          const applies = !cat.semester || cat.semester === studentSemester || cat.frequency === 'PER_SEMESTER' || cat.frequency === 'ONE_TIME';
          if (applies) {
            const existing = await FeeRecord.findOne({
              student: user._id,
              feeType: cat.feeType,
              semester: studentSemester,
              academicYear: publishedStructure.academicYear || studentAcademicYear
            });
            if (!existing) {
              const due = cat.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              await FeeRecord.create({
                student: user._id,
                feeType: cat.feeType,
                semester: studentSemester,
                academicYear: publishedStructure.academicYear || studentAcademicYear,
                totalAmount: cat.amount,
                balanceAmount: cat.amount,
                paidAmount: 0,
                dueDate: due,
                status: 'Pending',
                course: studentCourse,
                department: request.department || user.department,
                feeStructure: publishedStructure._id,
                feeStructureVersion: publishedStructure.version,
                remarks: `Initial registration fee assessment from ${publishedStructure.name}`
              });
            }
          }
        }
      }
    } catch (feeAssignErr) {
      console.warn('Auto fee assignment on approval note:', feeAssignErr.message);
    }

    // 6. Update RegistrationRequest
    request.status = 'APPROVED';
    request.assignedStudentId = assignedId;
    request.reviewedBy = req.user.id;
    request.reviewedByName = req.user.name || 'Administrator';
    request.reviewedAt = new Date();
    if (notes) request.adminNotes = notes;
    await request.save();

    // 7. Record Audit Log
    await AuditLog.create({
      actor: req.user.id,
      actorName: req.user.name || 'Administrator',
      actorRole: req.user.role || 'admin',
      action: 'REGISTRATION_APPROVED',
      resourceType: 'RegistrationRequest',
      resourceId: request.registrationId,
      details: {
        applicantEmail: request.email,
        assignedStudentId: assignedId,
        department: request.department
      },
      ipAddress: req.ip
    }).catch((e) => console.warn('AuditLog note:', e.message));

    // 8. Create In-App Notification for Student
    await Notification.create({
      recipient: user._id,
      type: 'REGISTRATION_APPROVED',
      title: 'Registration Approved! Welcome to SmartCampus AI',
      message: `Your registration request has been approved. Your official Student ID is ${assignedId}. You can now access all student portal features.`,
      link: '/student/dashboard',
      metadata: { registrationId: request.registrationId, studentId: assignedId }
    }).catch((e) => console.warn('Notification note:', e.message));

    res.status(200).json({
      success: true,
      message: `Registration request ${request.registrationId} approved. Student account activated with ID ${assignedId}.`,
      assignedStudentId: assignedId,
      registration: {
        id: request._id,
        registrationId: request.registrationId,
        status: request.status,
        assignedStudentId: request.assignedStudentId,
        reviewedAt: request.reviewedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reject a student registration request
 * @route   POST /api/admin/registration-requests/:id/reject
 * @access  Private / Admin
 */
const rejectRegistrationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    const request = await RegistrationRequest.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { registrationId: id.toUpperCase() }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Registration request not found.'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Registration request cannot be rejected because it is already ${request.status}.`
      });
    }

    const rejectionReason =
      reason?.trim() || 'Application does not meet current institutional admission requirements.';

    // 1. Update User account status
    let user = null;
    if (request.user) {
      user = await User.findById(request.user);
    }
    if (!user) {
      user = await User.findOne({ email: request.email });
    }

    if (user) {
      user.accountStatus = 'rejected';
      user.approvalStatus = 'REJECTED';
      await user.save();
    }

    // 2. Update RegistrationRequest
    request.status = 'REJECTED';
    request.reviewedBy = req.user.id;
    request.reviewedByName = req.user.name || 'Administrator';
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    if (notes) request.adminNotes = notes;
    await request.save();

    // 3. Record Audit Log
    await AuditLog.create({
      actor: req.user.id,
      actorName: req.user.name || 'Administrator',
      actorRole: req.user.role || 'admin',
      action: 'REGISTRATION_REJECTED',
      resourceType: 'RegistrationRequest',
      resourceId: request.registrationId,
      details: {
        applicantEmail: request.email,
        reason: rejectionReason
      },
      ipAddress: req.ip
    }).catch((e) => console.warn('AuditLog note:', e.message));

    // 4. Create Notification for applicant if user exists
    if (user) {
      await Notification.create({
        recipient: user._id,
        type: 'REGISTRATION_REJECTED',
        title: 'Registration Request Decision',
        message: `Your SmartCampus AI registration request was not approved: ${rejectionReason}`,
        link: '/register',
        metadata: { registrationId: request.registrationId, reason: rejectionReason }
      }).catch((e) => console.warn('Notification note:', e.message));
    }

    res.status(200).json({
      success: true,
      message: `Registration request ${request.registrationId} rejected.`,
      registration: {
        id: request._id,
        registrationId: request.registrationId,
        status: request.status,
        rejectionReason: request.rejectionReason,
        reviewedAt: request.reviewedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Public status inquiry for prospective students
 * @route   GET /api/auth/registration-status
 * @access  Public
 */
const getRegistrationStatus = async (req, res, next) => {
  try {
    const { reference, email } = req.query;

    if (!reference && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a registration reference or email address.'
      });
    }

    const query = {};
    if (reference) {
      query.registrationId = reference.trim().toUpperCase();
    } else if (email) {
      query.email = email.trim().toLowerCase();
    }

    const request = await RegistrationRequest.findOne(query).select(
      'registrationId name department course semester academicYear status assignedStudentId rejectionReason createdAt reviewedAt'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'No registration request found matching the provided reference or email.'
      });
    }

    res.status(200).json({
      success: true,
      registration: {
        registrationId: request.registrationId,
        status: request.status,
        name: request.name,
        department: request.department,
        course: request.course,
        semester: request.semester,
        academicYear: request.academicYear,
        assignedStudentId: request.assignedStudentId,
        rejectionReason: request.status === 'REJECTED' ? request.rejectionReason : undefined,
        submittedAt: request.createdAt,
        reviewedAt: request.reviewedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get live pending registration count for badges and metrics
 * @route   GET /api/admin/registration-requests/count/pending
 * @access  Private / Admin, Faculty
 */
const getPendingCount = async (req, res, next) => {
  try {
    const pendingCount = await RegistrationRequest.countDocuments({ status: 'PENDING' });
    res.status(200).json({
      success: true,
      pendingCount
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  getRegistrationStatus,
  getPendingCount
};
