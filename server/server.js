import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Подключаем роуты API
app.use('/api', routes);

let port = process.env.PORT;
if (!port) {
  port = 5000;
}

async function startServer() {
  console.log('[server] Вход в startServer');

  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('[server] MONGODB_URI есть:', mongoUri ? 'да' : 'нет');

    if (!mongoUri) {
      console.log('[server] Не найден MONGODB_URI в .env');
      process.exit(1);
    }

    console.log('[server] Подключаемся к MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[server] MongoDB подключена');

    console.log('[server] Запускаем HTTP сервер...');
    app.listen(port, function () {
      console.log('[server] Сервер запущен: http://localhost:' + port);
    });
  } catch (error) {
    console.log('[server] Ошибка при старте сервера');
    console.log(error);
    process.exit(1);
  }
}

startServer();
