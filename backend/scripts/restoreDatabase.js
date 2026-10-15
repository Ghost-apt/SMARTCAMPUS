/**
 * SmartCampus AI — Database Restore Utility
 * Safely restores database collections from a timestamped JSON backup archive.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectDB } = require('../config/database');
const CampusModels = require('../models/CampusModels');

const runRestore = async (specifiedBackupDir = null) => {
  console.log('🔄 [Database Restore]: Initializing SmartCampus AI restore process...');
  await connectDB();

  const backupsBase = path.join(__dirname, '..', 'backups');
  let targetDir = specifiedBackupDir;

  if (!targetDir) {
    if (!fs.existsSync(backupsBase)) {
      throw new Error(`No backups folder found at ${backupsBase}`);
    }
    const backupFolders = fs
      .readdirSync(backupsBase)
      .filter((f) => f.startsWith('backup-'))
      .sort()
      .reverse();

    if (backupFolders.length === 0) {
      throw new Error('No backup archives found to restore.');
    }
    targetDir = path.join(backupsBase, backupFolders[0]);
  }

  console.log(`📁 Restoring from archive: ${targetDir}`);

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

  let restoredTotal = 0;

  for (const { name, model } of collections) {
    const filePath = path.join(targetDir, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  Skipping ${name}: file not in archive`);
      continue;
    }

    try {
      const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(records) && records.length > 0) {
        // Upsert records to prevent duplicates and maintain referential integrity
        for (const item of records) {
          const id = item._id;
          delete item._id;
          await model.findByIdAndUpdate(id, item, { upsert: true, new: true, setDefaultsOnInsert: true });
        }
        restoredTotal += records.length;
        console.log(`   ✔ Restored ${name}: ${records.length} records`);
      } else {
        console.log(`   ℹ ${name}: 0 records`);
      }
    } catch (err) {
      console.error(`   ❌ Failed restoring ${name}:`, err.message);
    }
  }

  console.log(`\n✅ [Database Restore Complete]: ${restoredTotal} records restored.`);

  if (process.env.NODE_ENV !== 'test') {
    await mongoose.connection.close();
    process.exit(0);
  }

  return { targetDir, restoredTotal };
};

if (require.main === module) {
  const customDir = process.argv[2] || null;
  runRestore(customDir).catch((err) => {
    console.error('❌ Restore fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runRestore };
