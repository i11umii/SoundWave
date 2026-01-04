import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Track from './models/Track.js';
import Playlist from './models/Playlist.js';
import Artist from './models/Artist.js';
import Album from './models/Album.js';
import { protect } from './middleware/auth.js';

const router = express.Router();

// --- AUTH & PROFILE ---
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, badges: user.badges } });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Ищем пользователя
    // .select('+password') нужен, если в модели User.js стоит select: false для пароля
    const user = await User.findOne({ email }).select('+password');

    // 2. Если пользователя нет
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. ОТЛАДКА: Проверяем, есть ли хеш пароля
    if (!user.password) {
      console.error("USER ERROR: User found but has no password hash in DB:", user);
      return res.status(500).json({ message: 'User data corrupted (no password set)' });
    }

    // 4. Сравниваем пароли
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 5. Генерируем токен (берем секрет из .env)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        badges: user.badges
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message }); 
  }
});

router.get('/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('badges')
      .populate('playlists')
      .populate({ path: 'recentlyPlayed.track', populate: { path: 'artist' } });

    const history = user.recentlyPlayed || [];
    const totalSeconds = history.reduce((acc, item) => acc + (item.track ? item.track.duration : 0), 0);
    const hoursListened = Math.round(totalSeconds / 3600);
    const uniqueArtists = new Set(history.map(item => item.track?.artist?._id.toString()).filter(Boolean)).size;
    const earlyListens = user.badges.filter(b => b.id === 'EARLY_ADOPTER').length;

    const userData = user.toObject();
    userData.stats = { hoursListened, newArtistsDiscovered: uniqueArtists, earlyListens, playlistsCount: user.playlists.length };

    res.json({ success: true, data: userData });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- SEARCH ---
router.get('/users/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ success: true, data: { tracks: [], artists: [], playlists: [] } });
    const regex = new RegExp(query, 'i');
    const [tracks, artists, playlists] = await Promise.all([
      Track.find({ title: regex }).populate('artist').limit(5),
      Artist.find({ name: regex }).limit(5),
      Playlist.find({ name: regex }).limit(5)
    ]);
    res.json({ success: true, data: { tracks, artists, playlists } });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- ARTISTS ---
router.get('/artists', async (req, res) => {
  try {
    const artists = await Artist.find();
    res.json({ success: true, data: artists });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/artists/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
      .populate('albums')
      .populate({ path: 'topTracks', populate: { path: 'artist' } })
      .populate('similarArtists');

    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    const tracks = await Track.find({ artist: artist._id }).populate('artist');
    res.json({ success: true, data: { ...artist.toObject(), tracks } });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Artist not found' });
    res.status(500).json({ message: error.message });
  }
});

// !!! ИСПРАВЛЕННЫЙ РОУТ ПОДПИСКИ !!!
router.post('/artists/:id/follow', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // $addToSet добавляет ID, только если его там еще нет (защита от дублей)
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { followedArtists: req.params.id }
    });
    res.json({ success: true, message: 'Followed successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// !!! ИСПРАВЛЕННЫЙ РОУТ ОТПИСКИ !!!
router.delete('/artists/:id/follow', protect, async (req, res) => {
  try {
    // $pull удаляет ID из массива
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { followedArtists: req.params.id } 
    });
    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// НОВЫЙ РОУТ: ПОЛУЧИТЬ СПИСОК ПОДПИСОК (нужен для фронтенда)
router.get('/users/followed-artists', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('followedArtists');
    res.json({ success: true, data: user.followedArtists });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- TRACKS ---
router.get('/tracks', async (req, res) => {
  try {
    const tracks = await Track.find().populate('artist');
    res.json({ success: true, data: tracks });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/tracks/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('recentlyPlayed.track');

    // 1. Собираем ID уже прослушанных треков
    const playedIds = user.recentlyPlayed.map(item => item.track?._id).filter(Boolean);

    // 2. Определяем любимый жанр
    const lastTracks = user.recentlyPlayed
      .filter(item => item.track && item.track.genre)
      .slice(-50);

    const genreCounts = {};
    lastTracks.forEach(item => {
      const genre = item.track.genre;
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    let favoriteGenre = null;
    let maxCount = 0;
    for (const [genre, count] of Object.entries(genreCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteGenre = genre;
        }
    }

    // 3. Ищем НОВЫЕ треки (которых нет в playedIds)
    let query = { _id: { $nin: playedIds } };
    if (favoriteGenre) {
      query.genre = favoriteGenre;
    }

    let recommendations = await Track.find(query)
      .populate('artist')
      .limit(10);

    // --- ПЛАН Б (ИСПРАВЛЕННЫЙ) ---
    // Если набралось меньше 10 треков...
    if (recommendations.length < 10) {
      // Собираем ID тех треков, которые мы УЖЕ нашли в рекомендациях (чтобы не дублировать)
      const currentRecIds = recommendations.map(t => t._id);

      // Добираем любые популярные треки, даже если пользователь их уже слушал!
      // Главное, чтобы они не дублировали те, что уже есть в списке рекомендаций.
      const moreTracks = await Track.find({
        _id: { $nin: currentRecIds } // Исключаем только то, что уже добавили в этот список
      })
          .sort({ playCount: -1 }) // Самые популярные
        .populate('artist')
        .limit(10 - recommendations.length);

      recommendations = [...recommendations, ...moreTracks];
    }

    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- USER ACTIONS ---

// !!! NEW: UPDATE PROFILE ROUTE !!!
router.patch('/users/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.username = req.body.username || user.username;
      user.bio = req.body.bio || user.bio;

      const updatedUser = await user.save();

      // Возвращаем данные в том же формате, что и auth/me, чтобы не ломать фронт
      res.json({
        success: true,
        data: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          bio: updatedUser.bio,
          badges: updatedUser.badges
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/liked-tracks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: 'likedTracks', populate: { path: 'artist' } });
    res.json({ success: true, data: user.likedTracks });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/users/like/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const trackId = req.params.id;
    if (user.likedTracks.includes(trackId)) {
      user.likedTracks = user.likedTracks.filter(id => id.toString() !== trackId);
      await Track.findByIdAndUpdate(trackId, { $inc: { likes: -1 } });
    } else {
      user.likedTracks.push(trackId);
      await Track.findByIdAndUpdate(trackId, { $inc: { likes: 1 } });
    }
    await user.save();
    res.json({ success: true, likedTracks: user.likedTracks });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/users/recently-played', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: 'recentlyPlayed.track', populate: { path: 'artist' } });
    const history = user.recentlyPlayed.sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
    res.json({ success: true, data: history });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/users/recently-played/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    user.recentlyPlayed.push({ track: track._id, playedAt: new Date() });
    track.playCount = (track.playCount || 0) + 1;
    await track.save();

    let newBadge = null;
    if (track.playCount < 1000) {
      const hasBadge = user.badges.find(b => b.id === 'EARLY_ADOPTER');
      if (!hasBadge) {
        newBadge = { id: 'EARLY_ADOPTER', name: 'Trendsetter', icon: '💎', description: 'Discovered a hidden gem!', earnedAt: new Date() };
        user.badges.push(newBadge);
      }
    }
    await user.save();
    res.json({ success: true, newBadge });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- PLAYLISTS ---
router.get('/playlists', protect, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id });
    res.json({ success: true, data: playlists });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/playlists/:id', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate({ path: 'tracks.track', populate: { path: 'artist' } });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json({ success: true, data: playlist });
  } catch (error) { 
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Playlist not found' });
    res.status(500).json({ message: error.message }); 
  }
});

router.post('/playlists', protect, async (req, res) => {
  try {
    const playlist = await Playlist.create({ ...req.body, user: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { $push: { playlists: playlist._id } });
    res.json({ success: true, data: playlist });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/playlists/:id', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await Playlist.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user.id, { $pull: { playlists: req.params.id } });
    res.json({ success: true, message: 'Playlist removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/playlists/:id/tracks', protect, async (req, res) => {
  try {
    const { trackId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    if (playlist.tracks.some(t => t.track.toString() === trackId)) {
      return res.status(400).json({ message: 'Track already in playlist' });
    }

      playlist.tracks.push({ track: trackId, addedAt: new Date() });
      await playlist.save();
    res.json({ success: true, data: playlist });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/playlists/:id/tracks/:trackId', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    playlist.tracks = playlist.tracks.filter(t => t.track.toString() !== req.params.trackId);
    await playlist.save();
    res.json({ success: true, data: playlist });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- SMART STATS ---
router.get('/smart-stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: 'recentlyPlayed.track', populate: { path: 'artist' } });
    const history = user.recentlyPlayed;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCount = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    history.forEach(item => { const d = new Date(item.playedAt).getDay(); dayCount[days[d]]++; });

    const artistMap = {};
    history.forEach(item => { if (item.track?.artist) artistMap[item.track.artist.name] = (artistMap[item.track.artist.name] || 0) + 1; });
    const topArtists = Object.entries(artistMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

    const insights = [];
    if (history.length > 0) {
      const favoriteDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b);
      insights.push({ type: 'energy', icon: '📅', text: `Most active on: ${favoriteDay}`, value: dayCount[favoriteDay] });
    }
    if (history.length > 5) insights.push({ type: 'artist', icon: '🎵', text: `Total plays: ${history.length}`, value: history.length });

    res.json({ success: true, data: { insights, topArtists, dayStats: Object.entries(dayCount).map(([day, count]) => ({ day, count })) } });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// --- ALBUMS ---
router.get('/albums/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('artist') // Чтобы показать имя артиста и аватарку
      .populate({
        path: 'tracks',
        populate: { path: 'artist' } // Чтобы у каждого трека тоже был артист
      });

    if (!album) return res.status(404).json({ message: 'Album not found' });

    res.json({ success: true, data: album });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Album not found' });
    res.status(500).json({ message: error.message });
  }
});


export default router;