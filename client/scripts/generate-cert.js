import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certDir = path.resolve(__dirname, '../certs');

if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Collect local IP addresses for Subject Alternative Names (SAN)
const ips = ['127.0.0.1'];
const interfaces = os.networkInterfaces();
for (const dev in interfaces) {
  for (const details of interfaces[dev] || []) {
    if (details.family === 'IPv4' && !details.internal && !ips.includes(details.address)) {
      ips.push(details.address);
    }
  }
}

// Construct SAN entries for localhost and all detected LAN IPs
const altNames = [
  'DNS.1 = localhost',
  'DNS.2 = *.localhost',
  ...ips.map((ip, i) => `IP.${i + 1} = ${ip}`)
];

const opensslCnf = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C = US
ST = Campus
L = University
O = SmartCampus AI
OU = Development
CN = localhost

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
${altNames.join('\n')}
`.trim();

const cnfPath = path.join(certDir, 'openssl.cnf');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

fs.writeFileSync(cnfPath, opensslCnf, 'utf8');

try {
  console.log('Generating development SSL certificate with OpenSSL...');
  execSync(`openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -config "${cnfPath}"`, {
    stdio: 'inherit'
  });
  console.log('✅ Development SSL certificate generated successfully:');
  console.log('   - Certificate:', certPath);
  console.log('   - Private Key:', keyPath);
  console.log('   - Domains/IPs:', ['localhost', ...ips].join(', '));
} catch (err) {
  console.error('❌ Failed to generate SSL certificate:', err.message);
  process.exit(1);
} finally {
  if (fs.existsSync(cnfPath)) {
    fs.unlinkSync(cnfPath);
  }
}
