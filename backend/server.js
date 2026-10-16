const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { validateEnv } = require('./config/envValidator');
const { connectDB, getDbStatus } = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Validate environment configuration
validateEnv();

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
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { initScheduler } = require('./services/schedulerService');
const seedDemoUsers = require('./scripts/seedDemoUsers');

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ==========================================
// 1. CORE SECURITY & PARSING MIDDLEWARES
// ==========================================
// Helmet HTTP security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
  })
);

// Rate limiters (bypassed in test environment)
const isTestEnv = process.env.NODE_ENV === 'test';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  message: {
    success: false,
    message: 'AI query rate limit exceeded. Please wait a moment before sending another query.'
  }
});

// CORS Configuration supporting development and production frontend origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) || origin === CLIENT_ORIGIN) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Key']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads serving for profile pictures and media assets
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

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
  const memory = process.memoryUsage();

  res.status(200).json({
    status: db.connected ? 'healthy' : 'degraded',
    service: 'SmartCampus AI API',
    version: '6.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: db,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: {
        rss: Math.round(memory.rss / (1024 * 1024)),
        heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
        heapUsed: Math.round(memory.heapUsed / (1024 * 1024))
      }
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Kubernetes / Docker Readiness Probe
app.get('/api/health/ready', (req, res) => {
  const db = getDbStatus();
  if (!db.connected) {
    return res.status(503).json({
      status: 'not_ready',
      message: 'MongoDB connection is offline or reconnecting.'
    });
  }
  res.status(200).json({
    status: 'ready',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Kubernetes / Docker Liveness Probe
app.get('/api/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
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
// 4. API ROUTE MOUNTING WITH RATE LIMITING
// ==========================================
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api', academicRoutes);

// ==========================================
// 5. ERROR & 404 MIDDLEWARE
// ==========================================
app.use(notFound);
app.use(errorHandler);

// Global unhandled error guards
process.on('uncaughtException', (err) => {
  console.error('💥 [Server Uncaught Exception]:', err.message, err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [Server Unhandled Rejection]:', promise, 'reason:', reason);
});

// ==========================================
// 6. SERVER LIFECYCLE & GRACEFUL SHUTDOWN
// ==========================================
let server = null;

if (process.env.NODE_ENV !== 'test') {
  initScheduler();
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
