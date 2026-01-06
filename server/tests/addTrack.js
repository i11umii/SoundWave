import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Track from '../models/Track.js';

dotenv.config();

// ==========================================
// 🛠 НАСТРОЙКИ: МЕНЯЙ ДАННЫЕ ЗДЕСЬ
// ==========================================
const NEW_TRACK_DATA = {
    artistName: "The Midnight",   // Имя артиста (должен уже существовать в базе!)
    albumName: "Endless Summer",  // Имя альбома (должен уже существовать!)

    title: "My Super Test Track", // Название твоего трека
    duration: 205,                // Длительность в секундах
    genre: "Synthwave",           // Жанр

    // Ссылка на MP3 (можно взять любую прямую ссылку из интернета или Discord/Dropbox)
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",

    // Картинка трека
    imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop"
};
// ==========================================

const addTrack = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB');

        // 1. Ищем артиста
        const artist = await Artist.findOne({ name: NEW_TRACK_DATA.artistName });
        if (!artist) {
            console.error(`❌ Артист "${NEW_TRACK_DATA.artistName}" не найден! Создай его сначала или исправь имя.`);
            process.exit(1);
        }

        // 2. Ищем альбом
        // (Если трек сингл и без альбома, можно убрать этот блок, но у нас структура завязана на альбомах)
        const album = await Album.findOne({ title: NEW_TRACK_DATA.albumName, artist: artist._id });
        if (!album) {
            console.error(`❌ Альбом "${NEW_TRACK_DATA.albumName}" у этого артиста не найден!`);
            process.exit(1);
        }

        // 3. Создаем трек
        const newTrack = await Track.create({
            title: NEW_TRACK_DATA.title,
            artist: artist._id,
            album: NEW_TRACK_DATA.albumName, // Для совместимости с твоим кодом
            duration: NEW_TRACK_DATA.duration,
            audioUrl: NEW_TRACK_DATA.audioUrl,
            imageUrl: NEW_TRACK_DATA.imageUrl,
            genre: NEW_TRACK_DATA.genre,
            playCount: 0, // Начинаем с нуля
            likes: 0
        });

        // 4. СВЯЗЫВАЕМ: Добавляем трек в альбом
        album.tracks.push(newTrack._id);
        await album.save();

        // 5. СВЯЗЫВАЕМ: Добавляем трек в "Топ треки" артиста (чтобы сразу было видно)
        // Добавляем в начало массива
        artist.topTracks.unshift(newTrack._id);
        await artist.save();

        console.log(`✅ Трек "${newTrack.title}" успешно добавлен!`);
        console.log(`🔗 Привязан к артисту: ${artist.name}`);
        console.log(`💿 Привязан к альбому: ${album.title}`);
        console.log(`🆔 ID трека: ${newTrack._id}`);

        process.exit();
    } catch (error) {
        console.error('Ошибка:', error);
        process.exit(1);
    }
};

addTrack();