/**
 * SmartCampus AI — Unified Local Service Orchestrator
 * Spawns Backend (port 5000), AI Microservice (port 8000), and Frontend (port 5173) concurrently.
 * No Docker or external npm packages required at root.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
const AI_DIR = path.join(ROOT_DIR, 'ai-service');

const isWindows = process.platform === 'win32';

// ANSI terminal colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

const checkPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, '127.0.0.1');
  });
};

// Locate python executable (prefer virtualenv)
const getPythonPath = () => {
  const venvWin = path.join(AI_DIR, 'venv', 'Scripts', 'python.exe');
  const venvUnix = path.join(AI_DIR, 'venv', 'bin', 'python');

  if (fs.existsSync(venvWin)) return venvWin;
  if (fs.existsSync(venvUnix)) return venvUnix;
  return isWindows ? 'python' : 'python3';
};

const activeProcesses = [];

const shutdown = () => {
  console.log(`\n${colors.yellow}🛑 Shutting down SmartCampus AI services...${colors.reset}`);
  for (const p of activeProcesses) {
    if (p && !p.killed) {
      try {
        if (isWindows && p.pid) {
          execSync(`taskkill /pid ${p.pid} /t /f`, { stdio: 'ignore' });
        } else {
          p.kill('SIGINT');
        }
      } catch (e) {
        // Process might have already exited
      }
    }
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const logPrefix = (tag, color, data) => {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    if (line.trim().length > 0) {
      console.log(`${color}${colors.bold}[${tag}]${colors.reset} ${line}`);
    }
  }
};

const startServices = async () => {
  console.log(`${colors.cyan}${colors.bold}
============================================================
🎓 SmartCampus AI — Unified Local Service Orchestrator
============================================================${colors.reset}
`);

  const port5000Busy = await checkPortInUse(5000) || await checkPortInUse(5001);
  const port8000Busy = await checkPortInUse(8000);
  const port5173Busy = await checkPortInUse(5173);

  // 1. Backend Server
  if (port5000Busy) {
    console.log(`${colors.cyan}[BACKEND]${colors.reset} Backend API port is already active. Connected to existing instance.`);
  } else {
    console.log(`${colors.cyan}[BACKEND]${colors.reset} Starting Express API on http://localhost:5000...`);
    const backendProcess = spawn('node', ['server.js'], {
      cwd: BACKEND_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows,
      env: { ...process.env, NODE_ENV: 'development' }
    });
    backendProcess.stdout.on('data', (d) => logPrefix('BACKEND', colors.cyan, d));
    backendProcess.stderr.on('data', (d) => logPrefix('BACKEND', colors.red, d));
    activeProcesses.push(backendProcess);
  }

  // 2. Python AI & RAG Microservice
  if (port8000Busy) {
    console.log(`${colors.magenta}[AI-SERVICE]${colors.reset} Port 8000 is already active. Connected to existing instance.`);
  } else {
    const pythonExe = getPythonPath();
    console.log(`${colors.magenta}[AI-SERVICE]${colors.reset} Starting FastAPI on http://localhost:8000 using ${pythonExe}...`);
    const aiProcess = spawn(pythonExe, ['-m', 'uvicorn', 'app.main:app', '--port', '8000', '--host', '127.0.0.1'], {
      cwd: AI_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows,
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });
    aiProcess.stdout.on('data', (d) => logPrefix('AI-SERVICE', colors.magenta, d));
    aiProcess.stderr.on('data', (d) => logPrefix('AI-SERVICE', colors.red, d));
    activeProcesses.push(aiProcess);
  }

  // 3. Frontend Vite Client
  if (port5173Busy) {
    console.log(`${colors.green}[FRONTEND]${colors.reset} Port 5173 is already active. Serving on http://localhost:5173`);
  } else {
    console.log(`${colors.green}[FRONTEND]${colors.reset} Starting Vite React Client on http://localhost:5173...`);
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    const clientProcess = spawn(npmCmd, ['run', 'dev'], {
      cwd: CLIENT_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows
    });
    clientProcess.stdout.on('data', (d) => logPrefix('FRONTEND', colors.green, d));
    clientProcess.stderr.on('data', (d) => logPrefix('FRONTEND', colors.red, d));
    activeProcesses.push(clientProcess);
  }

  console.log(`
${colors.green}${colors.bold}✔ All microservices are active:${colors.reset}
  - 🖥️  Frontend:   ${colors.bold}https://localhost:5173${colors.reset} (or https://192.168.208.1:5173)
  - 📡 Backend API: ${colors.bold}http://localhost:5000${colors.reset}
  - 🤖 AI Service:  ${colors.bold}http://localhost:8000${colors.reset}

${colors.yellow}Press Ctrl+C to stop all services simultaneously.${colors.reset}
`);
};

startServices().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
