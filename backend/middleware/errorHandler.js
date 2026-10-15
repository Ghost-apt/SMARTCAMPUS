const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource '${req.originalUrl}' was not found on this server.`
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('❌ Server Error:', err.message || err);

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `An account with this ${field} already exists.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for: ${err.path}`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }

  // Generic internal server error
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode >= 500
      ? 'An unexpected server error occurred. Please contact the administrator if this persists.'
      : (err.message || 'Internal Server Error'),
    ...(isProduction ? {} : { stack: err.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};

