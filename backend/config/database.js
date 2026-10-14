const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcampus';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB Connection Failed: ${error.message}`);
    console.warn(`👉 To enable full database persistence, ensure MongoDB is running or specify MONGODB_URI in backend/.env`);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ MongoDB connection lost. Attempting reconnection...');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('✅ MongoDB reconnected.');
});

const getDbStatus = () => ({
  connected: isConnected,
  status: isConnected ? 'connected' : 'disconnected / offline',
  readyState: mongoose.connection.readyState
});

module.exports = {
  connectDB,
  getDbStatus
};
