import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jagat-academy');
    console.log('🔌 Connected to MongoDB');

    const users = await User.find({}, '_id name email role firebaseUid emailVerified approvalStatus');
    console.log('\n=================== USER DATABASE RENDER ===================');
    console.log(JSON.stringify(users, null, 2));
    console.log('============================================================\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  } catch (err) {
    console.error('❌ Diagnostic error:', err);
  }
};

run();
