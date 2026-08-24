import { spawn } from 'child_process';

console.log('⚡ Starting Express.js Backend Server & Vite Frontend Server...');

const expressServer = spawn('node', ['server.js'], { stdio: 'inherit', shell: true });
const viteDev = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  expressServer.kill();
  viteDev.kill();
  process.exit();
});
