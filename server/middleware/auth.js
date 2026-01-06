import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  console.log('[auth] protect: вход');

  try {
    let token = null;

    // Берем токен из заголовка Authorization: Bearer <token>
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader) {
      const startsWithBearer = authorizationHeader.startsWith('Bearer ');

      if (startsWithBearer) {
        const parts = authorizationHeader.split(' ');
        token = parts[1];
      }
    }

    if (!token) {
      console.log('[auth] protect: токен не найден');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    console.log('[auth] protect: проверяем токен');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('[auth] protect: ищем пользователя по id');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log('[auth] protect: пользователь не найден');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Кладем пользователя в req, чтобы дальше его использовать в роуте
    req.user = user;

    console.log('[auth] protect: доступ разрешен');
    return next();
  } catch (error) {
    console.log('[auth] protect: ошибка');
    console.log(error);

    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};
