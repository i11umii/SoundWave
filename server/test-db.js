import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔌 Testing MongoDB connection...\n');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('\n👋 Connection closed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  });