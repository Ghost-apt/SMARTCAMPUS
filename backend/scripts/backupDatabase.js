/**
 * SmartCampus AI — Database Backup Utility
 * Exports all database collections to timestamped JSON archives with integrity metadata.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectDB } = require('../config/database');
const CampusModels = require('../models/CampusModels');

const runBackup = async () => {
  console.log('🔄 [Database Backup]: Initializing SmartCampus AI backup process...');
  await connectDB();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', `backup-${timestamp}`);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const collections = [
    { name: 'User', model: CampusModels.User },
    { name: 'Department', model: CampusModels.Department },
    { name: 'Course', model: CampusModels.Course },
    { name: 'Subject', model: CampusModels.Subject },
    { name: 'StudentProfile', model: CampusModels.StudentProfile },
    { name: 'FacultyProfile', model: CampusModels.FacultyProfile },
    { name: 'Attendance', model: CampusModels.Attendance },
    { name: 'TimetableEntry', model: CampusModels.TimetableEntry },
    { name: 'Assignment', model: CampusModels.Assignment },
    { name: 'Examination', model: CampusModels.Examination },
    { name: 'Result', model: CampusModels.Result },
    { name: 'FeeRecord', model: CampusModels.FeeRecord },
    { name: 'Notice', model: CampusModels.Notice },
    { name: 'Resource', model: CampusModels.Resource },
    { name: 'AttendanceSession', model: CampusModels.AttendanceSession },
    { name: 'Notification', model: CampusModels.Notification }
  ];

  const metadata = {
    backupTimestamp: new Date().toISOString(),
    databaseName: mongoose.connection.name || 'smartcampus',
    collections: {},
    totalRecords: 0
  };

  for (const { name, model } of collections) {
    try {
      const records = await model.find({}).lean();
      const filePath = path.join(backupDir, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');

      metadata.collections[name] = {
        count: records.length,
        file: `${name}.json`
      };
      metadata.totalRecords += records.length;
      console.log(`   ✔ Exported ${name}: ${records.length} records`);
    } catch (err) {
      console.error(`   ❌ Failed to export ${name}:`, err.message);
      metadata.collections[name] = { error: err.message };
    }
  }

  const metaPath = path.join(backupDir, 'backup-metadata.json');
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8');

  console.log(`\n✅ [Database Backup Complete]: ${metadata.totalRecords} records exported to:`);
  console.log(`   ${backupDir}`);

  if (process.env.NODE_ENV !== 'test') {
    await mongoose.connection.close();
    process.exit(0);
  }

  return { backupDir, metadata };
};

if (require.main === module) {
  runBackup().catch((err) => {
    console.error('❌ Backup fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runBackup };
