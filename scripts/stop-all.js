/**
 * SmartCampus AI — Unified Local Service Shutdown Helper
 * Finds and terminates any background processes listening on ports 5000, 8000, 5173.
 */

const { execSync } = require('child_process');

const ports = [5000, 8000, 5173];
const isWindows = process.platform === 'win32';

console.log('🔍 Checking and freeing SmartCampus AI ports (5000, 8000, 5173)...');

if (isWindows) {
  for (const port of ports) {
    try {
      const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8' }).trim();
      const lines = output.split('\n');
      const pids = new Set();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(parseInt(pid, 10)) && parseInt(pid, 10) > 0) {
          pids.add(pid);
        }
      }

      for (const pid of pids) {
        try {
          execSync(`taskkill /pid ${pid} /f /t`, { stdio: 'ignore' });
          console.log(`✔ Terminated process PID ${pid} on port ${port}.`);
        } catch (e) {
          // Process already ended
        }
      }
    } catch (e) {
      // Port was not in use
      console.log(`ℹ Port ${port} is clear.`);
    }
  }
} else {
  for (const port of ports) {
    try {
      execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: 'ignore' });
      console.log(`✔ Cleared port ${port}.`);
    } catch (e) {
      console.log(`ℹ Port ${port} is clear.`);
    }
  }
}

console.log('✅ All SmartCampus AI services have been stopped.');
