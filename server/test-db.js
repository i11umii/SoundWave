import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testDb() {
  console.log('[test-db] вход');

  try {
    console.log('[test-db] подключаемся к MongoDB');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[test-db] подключение успешно');

    const dbName = mongoose.connection.db.databaseName;
    const host = mongoose.connection.host;

    console.log('[test-db] database =', dbName);
    console.log('[test-db] host =', host);

    console.log('[test-db] закрываем соединение');
    await mongoose.connection.close();

    console.log('[test-db] готово');
    process.exit(0);
  } catch (error) {
    console.log('[test-db] ошибка');
    console.log(error);
    process.exit(1);
  }
}

testDb();
