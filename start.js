#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Speed Motioner...');

// Kill any existing node processes (following user preference)
console.log('🔄 Killing existing processes...');
const killProcess = spawn('taskkill', ['/f', '/im', 'node.exe'], { shell: true });
killProcess.on('close', () => {
  console.log('✅ Existing processes killed');
  startServers();
});

function startServers() {
  console.log('🎯 Starting backend server...');
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  console.log('🎨 Starting frontend development server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  backend.on('close', (code) => {
    console.log(`🔴 Backend server exited with code ${code}`);
  });

  frontend.on('close', (code) => {
    console.log(`🔴 Frontend server exited with code ${code}`);
  });
}
