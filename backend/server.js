const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectDB, getDbStatus } = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const examRoutes = require('./routes/examRoutes');
const feeRoutes = require('./routes/feeRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const academicRoutes = require('./routes/academicRoutes');
const seedDemoUsers = require('./scripts/seedDemoUsers');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ==========================================
// 1. CORE MIDDLEWARES
// ==========================================
// CORS Configuration supporting development and production frontend origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      // Allow localhost on any port (for Vite dynamic ports) or configured CLIENT_ORIGIN
      if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) || origin === CLIENT_ORIGIN) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-permissive fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request Logger (Development mode)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ==========================================
// 2. DATABASE INITIALIZATION
// ==========================================
connectDB();

// ==========================================
// 3. SYSTEM & HEALTH ROUTES
// ==========================================
app.get('/', (req, res) => {
  res.json({
    message: '🎓 SmartCampus AI — Intelligent University Management API',
    tagline: 'Intelligent Campus Management & Student Support',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'POST /api/auth/logout', 'GET /api/auth/me'],
      users: ['GET /api/users/me', 'PATCH /api/users/me', 'GET /api/users'],
      dashboard: ['GET /api/dashboard/student', 'GET /api/dashboard/faculty', 'GET /api/dashboard/admin'],
      academic: ['GET /api/courses', 'GET /api/notices', 'GET /api/attendance/summary'],
      ai: ['POST /api/ai/chat'],
      seed: 'POST /api/seed'
    }
  });
});

app.get('/api/health', (req, res) => {
  const db = getDbStatus();
  const statusCode = db.connected ? 200 : 200; // Report 200 with honest status payload

  res.status(statusCode).json({
    status: db.connected ? 'healthy' : 'degraded',
    service: 'SmartCampus AI API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: db,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Demo seed trigger via API
app.post('/api/seed', async (req, res, next) => {
  const db = getDbStatus();
  if (!db.connected) {
    return res.status(503).json({
      success: false,
      message: 'Cannot seed database: MongoDB connection is currently offline.'
    });
  }

  try {
    // Run seed logic
    await seedDemoUsers();
    res.status(200).json({
      success: true,
      message: 'Demo dataset verified and seeded successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. API ROUTE MOUNTING
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api', examRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', academicRoutes);

// ==========================================
// 5. ERROR & 404 MIDDLEWARE
// ==========================================
app.use(notFound);
app.use(errorHandler);

// ==========================================
// 6. SERVER LIFECYCLE & GRACEFUL SHUTDOWN
// ==========================================
let server = null;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`
==================================================
🚀 SmartCampus AI Backend running on port ${PORT}
📡 URL: http://localhost:${PORT}
🩺 Health Check: http://localhost:${PORT}/api/health
==================================================
    `);
  });

  const handleShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Gracefully terminating SmartCampus AI server...`);
    if (server) {
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

module.exports = app;
