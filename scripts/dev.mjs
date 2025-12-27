import { spawn, execSync } from 'child_process';
import open from 'open';
import fs from 'fs';
import path from 'path';

const isWindows = process.platform === 'win32';
const lockFile = path.join(process.cwd(), '.next', 'dev', 'lock');

// Kill any existing next dev processes and remove lock file
try {
  if (isWindows) {
    // Kill any node processes running next dev on Windows
    execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq next*" 2>nul', { stdio: 'ignore' });
  } else {
    // Kill any existing next dev processes on macOS/Linux
    execSync("pkill -f 'next dev' 2>/dev/null || true", { stdio: 'ignore' });
  }
  // Remove lock file if it exists
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
} catch (e) {
  // Ignore errors - process might not exist
}

// Small delay to ensure processes are fully terminated
await new Promise(resolve => setTimeout(resolve, 500));

const nextDev = spawn(isWindows ? 'npx.cmd' : 'npx', ['next', 'dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

let browserOpened = false;

// Parse output to find the actual port
const handleOutput = (data) => {
  const output = data.toString();
  process.stdout.write(output);

  if (!browserOpened) {
    // Look for the Local URL in Next.js output
    const match = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
    if (match) {
      const port = match[1];
      browserOpened = true;
      // Open in Chrome specifically
      const chromeApp = isWindows ? 'chrome' : 'google chrome';
      open(`http://localhost:${port}`, { app: { name: chromeApp } });
    }
  }
};

nextDev.stdout.on('data', handleOutput);
nextDev.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

nextDev.on('close', (code) => {
  process.exit(code);
});
