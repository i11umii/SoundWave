import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function clearAndCreate() {
  console.log('[clear_and_create] вход');

  try {
    console.log('[clear_and_create] подключаемся к MongoDB');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[clear_and_create] MongoDB подключена');

    // Очищаем коллекцию пользователей
    await User.deleteMany({});
    console.log('[clear_and_create] все пользователи удалены');

    // Создаем демо-пользователя
    const hashedPassword = await bcrypt.hash('demo123', 10);

    const user = await User.create({
      username: 'demo',
      email: 'demo@soundwave.com',
      password: hashedPassword
    });

    console.log('[clear_and_create] демо-пользователь создан');
    console.log('[clear_and_create] id =', user._id.toString());
    console.log('[clear_and_create] email = demo@soundwave.com');
    console.log('[clear_and_create] password = demo123');

    process.exit(0);
  } catch (error) {
    console.log('[clear_and_create] ошибка');
    console.log(error);
    process.exit(1);
  }
}

clearAndCreate();
