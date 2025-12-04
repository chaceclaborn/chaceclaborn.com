import { spawn } from 'child_process';
import open from 'open';

const isWindows = process.platform === 'win32';
const nextDev = spawn(isWindows ? 'npx.cmd' : 'npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for the server to start, then open browser
setTimeout(() => {
  open('http://localhost:3000');
}, 3000);

nextDev.on('close', (code) => {
  process.exit(code);
});
