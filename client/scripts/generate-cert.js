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

// 1. Collect all local IP addresses for Subject Alternative Names (SAN)
const ips = ['127.0.0.1'];
const interfaces = os.networkInterfaces();
for (const dev in interfaces) {
  for (const details of interfaces[dev] || []) {
    if (details.family === 'IPv4' && !details.internal && !ips.includes(details.address)) {
      ips.push(details.address);
    }
  }
}

// Ensure 192.168.208.1 and 192.168.1.45 are both explicitly in SAN list
['192.168.208.1', '192.168.1.45'].forEach((ip) => {
  if (!ips.includes(ip)) {
    ips.push(ip);
  }
});

const caKeyPath = path.join(certDir, 'smartcampus-ca-key.pem');
const caCertPath = path.join(certDir, 'smartcampus-ca.pem');
const caCrtPath = path.join(certDir, 'smartcampus-ca.crt');
const serverKeyPath = path.join(certDir, 'key.pem');
const serverCertPath = path.join(certDir, 'cert.pem');

// 2. Generate Development Root CA if it doesn't exist
if (!fs.existsSync(caCertPath) || !fs.existsSync(caKeyPath)) {
  console.log('📌 Generating SmartCampus AI Development Root CA...');
  const caCnf = `
[req]
prompt = no
distinguished_name = dn
x509_extensions = v3_ca
default_md = sha256

[dn]
CN = SmartCampus AI Development Root CA
O = SmartCampus AI
OU = Security Engineering
C = US

[v3_ca]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
`.trim();

  const caCnfPath = path.join(certDir, 'ca_gen.cnf');
  fs.writeFileSync(caCnfPath, caCnf, 'utf8');

  try {
    execSync(`openssl req -x509 -new -nodes -newkey rsa:3072 -sha256 -days 3650 -keyout "${caKeyPath}" -out "${caCertPath}" -config "${caCnfPath}"`, {
      stdio: 'inherit'
    });
    fs.copyFileSync(caCertPath, caCrtPath);
    console.log('✔ Root CA generated successfully at:', caCertPath);
  } finally {
    if (fs.existsSync(caCnfPath)) fs.unlinkSync(caCnfPath);
  }
}

// 3. Generate Server Certificate signed by Root CA
console.log('📌 Generating Server Certificate for addresses:', ['localhost', ...ips].join(', '));

const altNames = [
  'DNS.1 = localhost',
  'DNS.2 = *.localhost',
  ...ips.map((ip, i) => `IP.${i + 1} = ${ip}`)
];

const serverCnf = `
[req]
prompt = no
distinguished_name = dn
req_extensions = v3_req
default_md = sha256

[dn]
CN = 192.168.208.1
O = SmartCampus AI
OU = Frontend Development
C = US

[v3_req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
${altNames.join('\n')}
`.trim();

const serverCnfPath = path.join(certDir, 'server_gen.cnf');
const serverCsrPath = path.join(certDir, 'server.csr');
fs.writeFileSync(serverCnfPath, serverCnf, 'utf8');

try {
  // Generate Server Private Key and CSR
  execSync(`openssl req -new -newkey rsa:2048 -nodes -keyout "${serverKeyPath}" -out "${serverCsrPath}" -config "${serverCnfPath}"`, {
    stdio: 'inherit'
  });

  // Sign Server CSR using Root CA
  execSync(`openssl x509 -req -in "${serverCsrPath}" -CA "${caCertPath}" -CAkey "${caKeyPath}" -CAcreateserial -out "${serverCertPath}" -days 825 -sha256 -extfile "${serverCnfPath}" -extensions v3_req`, {
    stdio: 'inherit'
  });

  // Ensure Windows .crt copy is available
  fs.copyFileSync(caCertPath, caCrtPath);

  console.log('✅ Development SSL certificate generated and signed by Local Root CA:');
  console.log('   - Server Certificate:', serverCertPath);
  console.log('   - Server Private Key:', serverKeyPath);
  console.log('   - Root CA Certificate:', caCrtPath);
  console.log('   - Subject Alternative Names (SAN):', ['localhost', ...ips].join(', '));
} catch (err) {
  console.error('❌ Failed to sign server certificate:', err.message);
  process.exit(1);
} finally {
  if (fs.existsSync(serverCnfPath)) fs.unlinkSync(serverCnfPath);
  if (fs.existsSync(serverCsrPath)) fs.unlinkSync(serverCsrPath);
}
