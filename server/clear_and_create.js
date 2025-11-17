import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const clearAndCreate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Удаляем всех пользователей
    await User.deleteMany({});
    console.log('✅ All users deleted');

    // Создаём нового демо юзера
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const user = await User.create({
      username: 'demo',
      email: 'demo@soundwave.com',
      password: hashedPassword
    });

    console.log('\n=================================');
    console.log('✅ Demo user created!');
    console.log('📧 Email: demo@soundwave.com');
    console.log('🔑 Password: demo123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearAndCreate();