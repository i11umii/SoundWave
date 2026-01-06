import mongoose from 'mongoose';

async function connectDB() {
  console.log('[db] connectDB: вход');

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('[db] MongoDB подключена, host =', conn.connection.host);
    return conn;
  } catch (error) {
    console.log('[db] ошибка подключения к MongoDB');
    console.log(error);
    process.exit(1);
  }
}

export default connectDB;
