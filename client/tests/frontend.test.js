/**
 * SmartCampus AI — Frontend Architecture & Contract Test Suite
 * Validates production build artifacts, route definitions, role access matrices, and component integrity.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.join(__dirname, '..');

describe('SmartCampus AI — Frontend Integrity & Contract Verification Suite', () => {
  // ------------------------------------------------------------
  // 1. PRODUCTION BUILD ASSETS VERIFICATION
  // ------------------------------------------------------------
  test('1. Production build output exists and contains valid entry point and assets', () => {
    const indexPath = path.join(clientRoot, 'dist', 'index.html');
    assert.ok(fs.existsSync(indexPath), 'dist/index.html must exist after vite build');

    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    assert.ok(htmlContent.includes('<div id="root">'), 'index.html must contain root mount div');
    assert.ok(htmlContent.includes('<script type="module"'), 'index.html must load module script');
    assert.ok(htmlContent.includes('SmartCampus'), 'index.html must include SmartCampus brand title');

    // Check assets directory
    const assetsDir = path.join(clientRoot, 'dist', 'assets');
    assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist');
    const assetFiles = fs.readdirSync(assetsDir);
    assert.ok(assetFiles.some((f) => f.endsWith('.js')), 'JavaScript bundle must be present in assets');
    assert.ok(assetFiles.some((f) => f.endsWith('.css')), 'CSS bundle must be present in assets');
  });

  // ------------------------------------------------------------
  // 2. ROUTE DEFINITIONS & RBAC GUARDS
  // ------------------------------------------------------------
  test('2. App.jsx defines all required role-specific routes and protected wrappers', () => {
    const appPath = path.join(clientRoot, 'src', 'App.jsx');
    assert.ok(fs.existsSync(appPath), 'src/App.jsx must exist');

    const appSource = fs.readFileSync(appPath, 'utf8');

    // Student Routes
    const requiredStudentRoutes = [
      '/student/dashboard',
      '/student/courses',
      '/student/attendance',
      '/student/timetable',
      '/student/assignments',
      '/student/results',
      '/student/fees',
      '/student/resources',
      '/student/notices',
      '/student/ai-assistant',
      '/student/ai'
    ];
    for (const route of requiredStudentRoutes) {
      assert.ok(appSource.includes(route), `App.jsx must declare student route: ${route}`);
    }

    // Faculty Routes
    const requiredFacultyRoutes = [
      '/faculty/dashboard',
      '/faculty/classes',
      '/faculty/attendance',
      '/faculty/assignments',
      '/faculty/performance',
      '/faculty/materials',
      '/faculty/notices'
    ];
    for (const route of requiredFacultyRoutes) {
      assert.ok(appSource.includes(route), `App.jsx must declare faculty route: ${route}`);
    }

    // Admin Routes
    const requiredAdminRoutes = [
      '/admin/dashboard',
      '/admin/students',
      '/admin/faculty',
      '/admin/departments',
      '/admin/courses',
      '/admin/timetable',
      '/admin/attendance',
      '/admin/notices',
      '/admin/analytics'
    ];
    for (const route of requiredAdminRoutes) {
      assert.ok(appSource.includes(route), `App.jsx must declare admin route: ${route}`);
    }

    // Protected Route component usage
    assert.ok(appSource.includes('<ProtectedRoute'), 'App.jsx must wrap authenticated routes in ProtectedRoute');
  });

  // ------------------------------------------------------------
  // 3. NAVIGATION & SIDEBAR ROLE CONTRACTS
  // ------------------------------------------------------------
  test('3. Sidebar navigation defines complete link structures for all 3 roles', () => {
    const sidebarPath = path.join(clientRoot, 'src', 'components', 'Sidebar.jsx');
    assert.ok(fs.existsSync(sidebarPath), 'Sidebar.jsx must exist');

    const sidebarSource = fs.readFileSync(sidebarPath, 'utf8');
    assert.ok(sidebarSource.includes('studentLinks'), 'Sidebar must define studentLinks');
    assert.ok(sidebarSource.includes('facultyLinks'), 'Sidebar must define facultyLinks');
    assert.ok(sidebarSource.includes('adminLinks'), 'Sidebar must define adminLinks');
    assert.ok(sidebarSource.includes('AI Academic Assistant'), 'Sidebar must include AI Academic Assistant');
  });

  // ------------------------------------------------------------
  // 4. RAG DOCUMENT ASSISTANT UI CONTRACT
  // ------------------------------------------------------------
  test('4. StudentAIPage implements Document Q&A (RAG) with citation support', () => {
    const aiPagePath = path.join(clientRoot, 'src', 'pages', 'StudentAIPage.jsx');
    assert.ok(fs.existsSync(aiPagePath), 'StudentAIPage.jsx must exist');

    const source = fs.readFileSync(aiPagePath, 'utf8');
    assert.ok(source.includes('Document Q&A (RAG)'), 'StudentAIPage must feature Document Q&A (RAG) tab');
    assert.ok(source.includes('/ai/document-assistant/query'), 'StudentAIPage must call document assistant API');
    assert.ok(source.includes('citations'), 'StudentAIPage must handle and display citations');
    assert.ok(source.includes('selectedSubject'), 'StudentAIPage must support subject filtering');
  });

  // ------------------------------------------------------------
  // 5. FACULTY RESOURCE & RAG UPLOAD CONTRACT
  // ------------------------------------------------------------
  test('5. FacultyMaterialsPage supports RAG indexing status and lecture text input', () => {
    const materialsPath = path.join(clientRoot, 'src', 'pages', 'FacultyMaterialsPage.jsx');
    assert.ok(fs.existsSync(materialsPath), 'FacultyMaterialsPage.jsx must exist');

    const source = fs.readFileSync(materialsPath, 'utf8');
    assert.ok(source.includes('RAG Indexed'), 'FacultyMaterialsPage must display RAG indexing badges');
    assert.ok(source.includes('/reindex'), 'FacultyMaterialsPage must support re-indexing study materials');
    assert.ok(source.includes('fullText'), 'FacultyMaterialsPage must provide full text input for RAG');
  });

  // ------------------------------------------------------------
  // 6. API CLIENT & AUTH INTERCEPTOR CONFIGURATION
  // ------------------------------------------------------------
  test('6. API service configures credentials and Authorization header interceptors', () => {
    const apiPath = path.join(clientRoot, 'src', 'services', 'api.js');
    assert.ok(fs.existsSync(apiPath), 'src/services/api.js must exist');

    const source = fs.readFileSync(apiPath, 'utf8');
    assert.ok(source.includes('withCredentials: true'), 'API client must enable withCredentials for cookies');
    assert.ok(source.includes('Authorization'), 'API client interceptor must attach Authorization Bearer token');
  });
});
