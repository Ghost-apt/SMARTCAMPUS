const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return typeof email === 'string' && re.test(email.trim());
};

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  // Security Rule: Public registration MUST NOT allow creating an Admin account!
  if (role && role.toLowerCase() === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin account creation is restricted to authorized administrators and database seeding.'
    });
  }

  if (role && !['student', 'faculty'].includes(role.toLowerCase())) {
    errors.push('Invalid account role. Allowed roles are: student, faculty.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' ')
    });
  }

  // Normalize email and name
  req.body.email = email.toLowerCase().trim();
  req.body.name = name.trim();
  req.body.role = role ? role.toLowerCase() : 'student';

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' ')
    });
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateEmail
};
