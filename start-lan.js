const os = require('os');
const { spawn } = require('child_process');
const path = require('path');

// 1. Find Local IP Address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
const apiUrl = `http://${localIp}:5001`;

console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[36m%s\x1b[0m', `🚀 Starting Rate Calculator on Local Network: ${localIp}`);
console.log('\x1b[36m%s\x1b[0m', '=======================================================');

// Helper to spawn processes
function runService(name, command, args, cwd, env = {}) {
  console.log(`[${name}] Starting...`);

  const fullCommand = `${command} ${args.join(' ')}`;

  const child = spawn(fullCommand, [], {
    cwd: path.resolve(__dirname, cwd),
    env: { ...process.env, ...env },
    shell: true,
    stdio: 'pipe'
  });

  child.stdout.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('Local:') || msg.includes('Network:') || msg.includes('Error')) {
      console.log(`[${name}] ${msg.trim()}`);
    }
  });

  child.stderr.on('data', (data) => {
    const msg = data.toString();
    if (!msg.includes('npm WARN') && !msg.includes('DeprecationWarning')) {
      console.error(`[${name} ERROR] ${msg.trim()}`);
    }
  });

  return child;
}

// Keep track of started processes
const processes = [];

// 2. Start Services
const backend = runService('Backend', 'npm', ['run', 'start'], '.', { PORT: 5001 });
processes.push(backend);

// We pass VITE_API_URL so the frontend knows where to reach the backend
const customer = runService('Customer', 'npm', ['run', 'dev', '--', '--host'], './frontends/customer', {
  VITE_API_URL: apiUrl
});
processes.push(customer);

const admin = runService('Admin', 'npm', ['run', 'dev', '--', '--host'], './frontends/admin', {
  VITE_API_URL: apiUrl
});
processes.push(admin);

console.log('\n\x1b[32m%s\x1b[0m', '✅ Services are Live!');
console.log(`\n📱 Access on your Home Wi-Fi:`);
console.log(`   Customer App: http://${localIp}:5173`);
console.log(`   Admin App:    http://${localIp}:5174`);
console.log(`   Backend API:  ${apiUrl}`);

console.log('\x1b[33m%s\x1b[0m', '\n(Press Ctrl+C to stop all services)');

// Cleanup on exit
const cleanup = () => {
  console.log('\nStopping services...');
  processes.forEach(p => p.kill());
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
