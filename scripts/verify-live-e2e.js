/**
 * verify-live-e2e.js
 * End-to-end verification script against live running services (ports 80, 5000, 8000).
 */
const assert = require('node:assert/strict');

async function runLiveTests() {
  console.log('========================================================');
  console.log('   SMARTCAMPUS AI — LIVE END-TO-END VERIFICATION SUITE  ');
  console.log('========================================================\n');

  // 1. Health check
  console.log('1. Checking Backend Health (/api/health)...');
  const healthRes = await fetch('http://localhost:5000/api/health');
  assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200');
  const healthJson = await healthRes.json();
  assert.strictEqual(healthJson.service, 'SmartCampus AI API');
  console.log(`   ✔ Backend is healthy (Database: ${healthJson.database.status})\n`);

  // 2. Student Authentication
  console.log('2. Authenticating Student (student@smartcampus.edu)...');
  const sRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@smartcampus.edu', password: 'Student@123' })
  });
  assert.strictEqual(sRes.status, 200, 'Student login should succeed');
  const sData = await sRes.json();
  assert.ok(sData.token, 'Token must be returned');
  assert.strictEqual(sData.user.role, 'student');
  const studentToken = sData.token;
  console.log(`   ✔ Student login successful: ${sData.user.name} (${sData.user.role})\n`);

  // 3. Faculty Authentication
  console.log('3. Authenticating Faculty (faculty@smartcampus.edu)...');
  const fRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'faculty@smartcampus.edu', password: 'Faculty@123' })
  });
  assert.strictEqual(fRes.status, 200, 'Faculty login should succeed');
  const fData = await fRes.json();
  assert.ok(fData.token);
  assert.strictEqual(fData.user.role, 'faculty');
  const facultyToken = fData.token;
  console.log(`   ✔ Faculty login successful: ${fData.user.name} (${fData.user.role})\n`);

  // 4. Admin Authentication
  console.log('4. Authenticating Admin (admin@smartcampus.edu)...');
  const aRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@smartcampus.edu', password: 'Admin@123' })
  });
  assert.strictEqual(aRes.status, 200, 'Admin login should succeed');
  const aData = await aRes.json();
  assert.ok(aData.token);
  assert.strictEqual(aData.user.role, 'admin');
  const adminToken = aData.token;
  console.log(`   ✔ Admin login successful: ${aData.user.name} (${aData.user.role})\n`);

  // 5. Protected Profile Verification & RBAC
  console.log('5. Verifying Protected Profile & RBAC...');
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.strictEqual(meRes.status, 200);
  const meData = await meRes.json();
  assert.strictEqual(meData.user.email, 'student@smartcampus.edu');

  // Verify Student cannot access Admin dashboard
  const forbiddenRes = await fetch('http://localhost:5000/api/dashboard/admin', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.strictEqual(forbiddenRes.status, 403, 'Student should be forbidden from Admin dashboard');
  console.log('   ✔ RBAC enforcement verified: Student blocked from Admin API (HTTP 403)\n');

  // 6. Notices Endpoint
  console.log('6. Verifying Campus Notices (/api/notices)...');
  const noticeRes = await fetch('http://localhost:5000/api/notices', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.strictEqual(noticeRes.status, 200);
  const notices = await noticeRes.json();
  console.log(`   ✔ Notices fetched: count = ${notices.count || (Array.isArray(notices) ? notices.length : 0)}\n`);

  // 7. AI Service Health
  console.log('7. Checking AI Microservice Health (http://localhost:8000/health)...');
  const aiHealthRes = await fetch('http://localhost:8000/health');
  assert.strictEqual(aiHealthRes.status, 200);
  const aiHealth = await aiHealthRes.json();
  assert.strictEqual(aiHealth.status, 'healthy');
  assert.strictEqual(aiHealth.ml_model_loaded, true);
  console.log(`   ✔ AI Service is healthy (Model Loaded: ${aiHealth.ml_model_loaded}, Version: ${aiHealth.version})\n`);

  // 8. AI Microservice Direct Support / Risk Evaluation (/predict/academic-support)
  console.log('8. Testing AI Direct Evaluation (/predict/academic-support)...');
  const predRes = await fetch('http://localhost:8000/predict/academic-support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: 'STU-LIVE-001',
      name: 'Test Student',
      department: 'BCA',
      semester: 5,
      attendance_percentage: 88.5,
      assignment_completion_rate: 92.0,
      average_exam_marks: 85.0,
      failed_assignments_count: 0,
      attendance_trend: 1.5,
      subject_scores: [
        { subject_code: 'BCA-501', subject_name: 'Java Programming', attendance_rate: 90, exam_score: 88 }
      ]
    })
  });
  assert.strictEqual(predRes.status, 200);
  const predData = await predRes.json();
  assert.ok(['Low', 'Medium', 'High'].includes(predData.risk_level));
  console.log(`   ✔ Academic support assessed: Risk Level = ${predData.risk_level} (Score: ${predData.risk_score}, Method: ${predData.evaluation_basis})\n`);

  // 9. Backend AI Integration (/api/ai/academic-insights)
  console.log('9. Testing Backend-to-AI Integration (/api/ai/academic-insights)...');
  const insightsRes = await fetch('http://localhost:5000/api/ai/academic-insights', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.strictEqual(insightsRes.status, 200);
  const insights = await insightsRes.json();
  assert.ok(insights.success);
  console.log(`   ✔ Backend AI insights retrieved: Student = ${insights.metrics.name}, Risk = ${insights.analysis.riskLevel}\n`);

  // 10. Frontend Reverse Proxy on Port 80
  console.log('10. Testing Frontend Reverse Proxy (http://localhost/)...');
  const feRes = await fetch('http://localhost/');
  assert.strictEqual(feRes.status, 200);
  const feHtml = await feRes.text();
  assert.ok(feHtml.includes('<div id="root">'), 'Frontend should deliver React SPA root HTML');
  console.log('   ✔ Frontend Nginx reverse proxy serves React SPA on port 80\n');

  console.log('========================================================');
  console.log('   ALL 10 LIVE END-TO-END WORKFLOW CHECKS PASSED!       ');
  console.log('========================================================');
}

runLiveTests().catch((err) => {
  console.error('\n❌ LIVE TEST FAILED:', err);
  process.exit(1);
});
