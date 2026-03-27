import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/breathart';

export const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 Connection String:', MONGODB_URI.replace(/mongodb\+srv:\/\/.*:.*@/, 'mongodb+srv://***:***@'));
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log('📊 Database: breathart');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect from MongoDB:', error.message);
  }
};

export default mongoose.connection;
