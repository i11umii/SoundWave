import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Artist from './models/Artist.js';
import Track from './models/Track.js';
import Playlist from './models/Playlist.js';
import TrackComment from './models/TrackComment.js';
import { protect } from './middleware/auth.js';

const router = express.Router();

// ============================================
// AUTH
// ============================================

router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/live-feed/:id/react', protect, async (req, res) => {
  try {
    const { emoji } = req.body;
    // Реакции можно реализовать позже
    res.json({ success: true, message: 'Reaction added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// MUSIC DNA
// ============================================

router.get('/music-dna', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'recentlyPlayed.track', populate: { path: 'artist' } })
      .populate({ path: 'likedTracks', populate: { path: 'artist' } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validRecentTracks = user.recentlyPlayed
      .filter((item) => item.track && item.track._id)
      .map((item) => ({
        ...item.track.toObject(),
        playedAt: item.playedAt,
        mood: item.mood
      }));

    // Анализ личности
    let personality = 'Casual Listener';
    if (validRecentTracks.length > 50) personality = 'Music Enthusiast';
    if (validRecentTracks.length > 200) personality = 'Music Addict';
    if (user.likedTracks.length > 100) personality = 'Collector';

    // Анализ времени прослушивания
    const hourCount = Array(24).fill(0);
    validRecentTracks.forEach((item) => {
      const hour = new Date(item.playedAt).getHours();
      hourCount[hour]++;
    });
    const peakHour = hourCount.indexOf(Math.max(...hourCount));

    let listeningTime = 'Morning Person';
    if (peakHour >= 12 && peakHour < 18) listeningTime = 'Afternoon Listener';
    if (peakHour >= 18 && peakHour < 24) listeningTime = 'Night Owl';
    if (peakHour >= 0 && peakHour < 6) listeningTime = 'Midnight Listener';

    // Анализ настроений
    const moodCount = {};
    user.recentlyPlayed.forEach((item) => {
      if (item.mood) {
        moodCount[item.mood] = (moodCount[item.mood] || 0) + 1;
      }
    });
    const topMood =
      Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Chill';
    const topMoodPercentage =
      user.recentlyPlayed.length > 0
        ? Math.round((moodCount[topMood] / user.recentlyPlayed.length) * 100)
        : 0;

    // Early Adopter
    const avgPlayCount =
      validRecentTracks.reduce((sum, t) => sum + (t.playCount || 0), 0) /
      (validRecentTracks.length || 1);
    const earlyAdopter = validRecentTracks.length > 0 && avgPlayCount < 1000000;

    // Топ жанры
    const genreCount = {};
    validRecentTracks.forEach((track) => {
      if (track.genre) {
        genreCount[track.genre] = (genreCount[track.genre] || 0) + 1;
      }
    });
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre, count]) => ({
        genre,
        percentage: Math.round((count / validRecentTracks.length) * 100)
      }));

    const musicDNA = {
      personality,
      listeningTime,
      peakHour,
      topMood,
      topMoodPercentage,
      earlyAdopter,
      topGenres,
      totalTracks: validRecentTracks.length,
      likedTracks: user.likedTracks.length,
      followedArtists: user.followedArtists.length
    };

    // Кэшируем базовые поля в профиле
    user.musicDNA = {
      personality,
      listeningTime,
      topMood,
      earlyAdopter
    };
    await user.save();

    res.json({ success: true, data: musicDNA });
  } catch (error) {
    console.error('Music DNA error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// SMART STATS
// ============================================

router.get('/smart-stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'recentlyPlayed.track', populate: { path: 'artist' } })
      .populate({ path: 'likedTracks', populate: { path: 'artist' } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validRecentTracks = user.recentlyPlayed.filter(
      (item) => item.track && item.track._id
    );

    if (validRecentTracks.length === 0) {
      return res.json({
        success: true,
        data: { insights: [], topArtists: [], compatibility: [], dayStats: [] }
      });
    }

    // Анализ по дням недели
    const dayCount = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayGenres = { Mon: {}, Tue: {}, Wed: {}, Thu: {}, Fri: {}, Sat: {}, Sun: {} };
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    validRecentTracks.forEach((item) => {
      const day = days[new Date(item.playedAt).getDay()];
      dayCount[day]++;

      const genre = item.track.genre;
      if (genre) {
        dayGenres[day][genre] = (dayGenres[day][genre] || 0) + 1;
      }
    });

    // "Грустные понедельники"
    const mondayGenres = dayGenres['Mon'];
    const totalMonday = dayCount['Mon'] || 1;
    const sadMusicMonday = ['Ambient', 'Classical', 'Lo-fi'].reduce(
      (sum, g) => sum + (mondayGenres[g] || 0),
      0
    );
    const sadPercentageMonday = (sadMusicMonday / totalMonday) * 100;

    const totalAllDays = validRecentTracks.length;
    const sadMusicTotal = validRecentTracks.filter((t) =>
      ['Ambient', 'Classical', 'Lo-fi'].includes(t.track.genre)
    ).length;
    const sadPercentageTotal = (sadMusicTotal / totalAllDays) * 100;

    const sadMondaysDiff = Math.round(sadPercentageMonday - sadPercentageTotal);

    // Топ артисты
    const artistCount = {};
    validRecentTracks.forEach((item) => {
      if (item.track?.artist) {
        const artistId = item.track.artist._id.toString();
        const artistName = item.track.artist.name;
        if (!artistCount[artistId]) {
          artistCount[artistId] = { id: artistId, name: artistName, count: 0 };
        }
        artistCount[artistId].count++;
      }
    });
    const topArtists = Object.values(artistCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Совместимость с другими пользователями
    const allUsers = await User.find({ _id: { $ne: req.user.id } })
      .populate({ path: 'recentlyPlayed.track', populate: { path: 'artist' } })
      .limit(10);

    const userGenres = {};
    validRecentTracks.forEach((item) => {
      if (item.track.genre) {
        userGenres[item.track.genre] = (userGenres[item.track.genre] || 0) + 1;
      }
    });

    const compatibility = allUsers
      .map((otherUser) => {
        const otherTracks = otherUser.recentlyPlayed
          .filter((i) => i.track)
          .map((i) => i.track);
        if (otherTracks.length === 0) return null;

        const otherGenres = {};
        otherTracks.forEach((track) => {
          if (track.genre) {
            otherGenres[track.genre] = (otherGenres[track.genre] || 0) + 1;
          }
        });

        const allGenres = new Set([
          ...Object.keys(userGenres),
          ...Object.keys(otherGenres)
        ]);
        let similarity = 0;

        allGenres.forEach((genre) => {
          const userCount = userGenres[genre] || 0;
          const otherCount = otherGenres[genre] || 0;
          const userPerc = userCount / validRecentTracks.length;
          const otherPerc = otherCount / otherTracks.length;
          similarity += 1 - Math.abs(userPerc - otherPerc);
        });

        const percentage = Math.round((similarity / allGenres.size) * 100);

        return {
          username: otherUser.username,
          percentage
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    // Глобальный рейтинг
    const favoriteGenre = topArtists[0]
      ? validRecentTracks.find(
        (t) => t.track?.artist?._id.toString() === topArtists[0].id
      )?.track?.genre
      : null;

    let globalRank = null;
    if (favoriteGenre) {
      const userGenreCount = validRecentTracks.filter(
        (t) => t.track.genre === favoriteGenre
      ).length;
      const userGenrePercentage = (userGenreCount / validRecentTracks.length) * 100;

      if (userGenrePercentage > 50) globalRank = Math.floor(Math.random() * 5) + 1;
      else if (userGenrePercentage > 30)
        globalRank = Math.floor(Math.random() * 10) + 5;
      else globalRank = Math.floor(Math.random() * 20) + 10;
    }

    // Пиковое время
    const hourCount = Array(24).fill(0);
    validRecentTracks.forEach((item) => {
      const hour = new Date(item.playedAt).getHours();
      hourCount[hour]++;
    });
    const peakHour = hourCount.indexOf(Math.max(...hourCount));

    // Insights
    const insights = [
      sadMondaysDiff > 10 && dayCount['Mon'] > 0
        ? {
          type: 'mood',
          icon: '📊',
          text: `You listen to ${sadMondaysDiff}% more chill music on Mondays`,
          value: Math.abs(sadMondaysDiff)
        }
        : null,
      compatibility[0] && compatibility[0].percentage > 50
        ? {
          type: 'compatibility',
          icon: '🎵',
          text: `Your taste is ${compatibility[0].percentage}% compatible with ${compatibility[0].username}`,
          value: compatibility[0].percentage
        }
        : null,
      favoriteGenre && globalRank
        ? {
          type: 'global',
          icon: '🌍',
          text: `You're in top ${globalRank}% of ${favoriteGenre} listeners worldwide`,
          value: globalRank
        }
        : null,
      {
        type: 'energy',
        icon: '⏰',
        text: `Your music energy peaks at ${peakHour}:00`,
        value: peakHour
      },
      topArtists.length > 0
        ? {
          type: 'artist',
          icon: '🎤',
          text: `You've listened to ${topArtists[0].name} ${topArtists[0].count} times`,
          value: topArtists[0].count
        }
        : null
    ].filter(Boolean);

    res.json({
      success: true,
      data: {
        insights,
        topArtists,
        compatibility,
        dayStats: Object.entries(dayCount).map(([day, count]) => ({ day, count }))
      }
    });
  } catch (error) {
    console.error('Smart stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// TRACKS
// ============================================

router.get('/tracks', async (req, res) => {
  try {
    const tracks = await Track.find()
      .populate('artist')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: tracks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/tracks/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id).populate('artist');
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    res.json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/tracks/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'recentlyPlayed.track', populate: { path: 'artist' } })
      .populate({ path: 'likedTracks', populate: { path: 'artist' } });

    let tracks;

    if (user.recentlyPlayed.length > 0 || user.likedTracks.length > 0) {
      const recentTracks = user.recentlyPlayed
        .slice(0, 20)
        .map((r) => r.track)
        .filter(Boolean);
      const allUserTracks = [...recentTracks, ...user.likedTracks];

      const genreCount = {};
      const artistIds = [];

      allUserTracks.forEach((track) => {
        if (track.genre) {
          genreCount[track.genre] = (genreCount[track.genre] || 0) + 1;
        }
        if (track.artist && track.artist._id) {
          artistIds.push(track.artist._id);
        }
      });

      const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);

      const userTrackIds = allUserTracks.map((t) => t._id);

      tracks = await Track.find({
        $or: [{ genre: { $in: topGenres } }, { artist: { $in: artistIds } }],
        _id: { $nin: userTrackIds }
      })
        .populate('artist')
        .limit(30);

      tracks = tracks.sort(() => Math.random() - 0.5);
    } else {
      tracks = await Track.find()
        .populate('artist')
        .sort({ playCount: -1 })
        .limit(30);
    }

    res.json({ success: true, data: tracks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tracks/:id/like', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const track = await Track.findById(req.params.id);

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    if (!user.likedTracks.includes(track._id)) {
      user.likedTracks.push(track._id);
      track.likes += 1;
      await user.save();
      await track.save();
    }

    res.json({ success: true, message: 'Track liked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/tracks/:id/like', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.likedTracks = user.likedTracks.filter(
      (id) => id.toString() !== req.params.id
    );

    const track = await Track.findById(req.params.id);
    if (track && track.likes > 0) {
      track.likes -= 1;
      await track.save();
    }

    await user.save();
    res.json({ success: true, message: 'Track unliked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// TIMELINE COMMENTS
// ============================================

// GET /tracks/:id/comments
router.get('/tracks/:id/comments', protect, async (req, res) => {
  try {
    const { id: trackId } = req.params;

    const trackExists = await Track.exists({ _id: trackId });
    if (!trackExists) {
      return res.status(404).json({
        success: false,
        message: 'Track not found'
      });
    }

    const comments = await TrackComment.find({ track: trackId })
      .populate('user', 'username')
      .sort({ timeSec: 1, createdAt: 1 });

    const data = comments.map((c) => ({
      _id: c._id,
      user: {
        _id: c.user?._id,
        username: c.user?.username || 'Unknown User'
      },
      timeSec: c.timeSec,
      text: c.text,
      createdAt: c.createdAt
    }));

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get track comments error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /tracks/:id/comments
router.post('/tracks/:id/comments', protect, async (req, res) => {
  try {
    const { id: trackId } = req.params;
    const { timeSec, text } = req.body;

    if (
      timeSec === undefined ||
      timeSec === null ||
      isNaN(Number(timeSec)) ||
      Number(timeSec) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'timeSec must be a non-negative number'
      });
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'text is required'
      });
    }

    const trackExists = await Track.exists({ _id: trackId });
    if (!trackExists) {
      return res.status(404).json({
        success: false,
        message: 'Track not found'
      });
    }

    const comment = await TrackComment.create({
      track: trackId,
      user: req.user.id,
      timeSec: Math.floor(Number(timeSec)),
      text: text.trim()
    });

    await comment.populate('user', 'username');

    return res.status(201).json({
      success: true,
      data: {
        _id: comment._id,
        user: {
          _id: comment.user?._id,
          username: comment.user?.username || 'Unknown User'
        },
        timeSec: comment.timeSec,
        text: comment.text,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error('Create track comment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ARTISTS
// ============================================

router.get('/artists', async (req, res) => {
  try {
    const artists = await Artist.find().sort({ followers: -1 }).limit(50);
    res.json({ success: true, data: artists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/artists/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('topTracks');
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    const tracks = await Track.find({ artist: artist._id }).populate('artist');
    res.json({ success: true, data: { ...artist.toObject(), tracks } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/artists/:id/follow', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    if (!user.followedArtists.includes(artist._id)) {
      user.followedArtists.push(artist._id);
      artist.followers += 1;
      await user.save();
      await artist.save();
    }

    res.json({ success: true, message: 'Artist followed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/artists/:id/follow', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.followedArtists = user.followedArtists.filter(
      (id) => id.toString() !== req.params.id
    );

    const artist = await Artist.findById(req.params.id);
    if (artist && artist.followers > 0) {
      artist.followers -= 1;
      await artist.save();
    }

    await user.save();
    res.json({ success: true, message: 'Artist unfollowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// PLAYLISTS
// ============================================

router.get('/playlists', protect, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id }).populate(
      'tracks.track'
    );
    res.json({ success: true, data: playlists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/playlists/:id', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate({
      path: 'tracks.track',
      populate: { path: 'artist' }
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/playlists', protect, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const playlist = await Playlist.create({
      name,
      description,
      user: req.user.id,
      color: color || 'blue',
      icon: icon || 'fa-music'
    });
    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/playlists/:id', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    if (playlist.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await playlist.deleteOne();
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/playlists/:id/tracks', protect, async (req, res) => {
  try {
    const { trackId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const trackExists = playlist.tracks.some(
      (t) => t.track.toString() === trackId
    );
    if (!trackExists) {
      playlist.tracks.push({ track: trackId, addedAt: new Date() });
      await playlist.save();
    }

    const updated = await Playlist.findById(playlist._id).populate({
      path: 'tracks.track',
      populate: { path: 'artist' }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/playlists/:id/tracks/:trackId', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.tracks = playlist.tracks.filter(
      (t) => t.track.toString() !== req.params.trackId
    );
    await playlist.save();

    res.json({ success: true, message: 'Track removed from playlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// USER
// ============================================

router.get('/users/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('likedTracks')
      .populate('followedArtists')
      .populate('playlists');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/users/me', protect, async (req, res) => {
  try {
    const { username, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, bio },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/recently-played', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'recentlyPlayed.track',
      populate: { path: 'artist' }
    });
    const recent = user.recentlyPlayed
      .sort((a, b) => b.playedAt - a.playedAt)
      .slice(0, 50);
    res.json({ success: true, data: recent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/users/recently-played/:trackId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const track = await Track.findById(req.params.trackId);

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    user.recentlyPlayed.push({ track: track._id, playedAt: new Date() });
    if (user.recentlyPlayed.length > 100) {
      user.recentlyPlayed = user.recentlyPlayed.slice(-100);
    }

    track.playCount += 1;
    await track.save();
    await user.save();

    res.json({ success: true, message: 'Added to recently played' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/liked-tracks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'likedTracks',
      populate: { path: 'artist' }
    });
    res.json({ success: true, data: user.likedTracks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, data: { tracks: [], artists: [] } });
    }

    const tracks = await Track.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('artist')
      .limit(10);

    const artists = await Artist.find({
      name: { $regex: q, $options: 'i' }
    }).limit(10);

    res.json({ success: true, data: { tracks, artists } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'recentlyPlayed.track', populate: { path: 'artist' } })
      .populate({ path: 'likedTracks', populate: { path: 'artist' } });

    const genreCount = {};
    const artistCount = {};
    const hourCount = Array(24).fill(0);
    const trackPlayCount = {};
    let totalMinutes = 0;

    user.recentlyPlayed.forEach((item) => {
      if (item.track) {
        const track = item.track;

        genreCount[track.genre] = (genreCount[track.genre] || 0) + 1;

        const artistId = track.artist?._id?.toString();
        const artistName = track.artist?.name;
        if (artistId) {
          if (!artistCount[artistId]) {
            artistCount[artistId] = { id: artistId, name: artistName, count: 0 };
          }
          artistCount[artistId].count++;
        }

        const hour = new Date(item.playedAt).getHours();
        hourCount[hour]++;

        const trackId = track._id.toString();
        trackPlayCount[trackId] = (trackPlayCount[trackId] || 0) + 1;

        totalMinutes += Math.floor(track.duration / 60);
      }
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / user.recentlyPlayed.length) * 100)
      }));

    const topArtists = Object.values(artistCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topTracks = Object.entries(trackPlayCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([trackId, count]) => {
        const track = user.recentlyPlayed.find(
          (r) => r.track?._id?.toString() === trackId
        )?.track;
        return track ? { ...track.toObject(), playCount: count } : null;
      })
      .filter(Boolean);

    const peakHour = hourCount.indexOf(Math.max(...hourCount));

    let personality = 'Casual Listener';
    if (user.recentlyPlayed.length > 100) personality = 'Music Enthusiast';
    if (user.recentlyPlayed.length > 300) personality = 'Music Addict';
    if (user.likedTracks.length > 50) personality = 'Collector';

    let listeningTime = 'Morning Person';
    if (peakHour >= 12 && peakHour < 18) listeningTime = 'Afternoon Listener';
    if (peakHour >= 18 && peakHour < 24) listeningTime = 'Night Owl';
    if (peakHour >= 0 && peakHour < 6) listeningTime = 'Midnight Listener';

    const stats = {
      overview: {
        totalHours: Math.floor(totalMinutes / 60),
        totalMinutes,
        totalTracks: user.recentlyPlayed.length,
        likedTracks: user.likedTracks.length,
        followedArtists: user.followedArtists.length,
        playlists: user.playlists.length
      },
      musicDNA: {
        personality,
        listeningTime,
        peakHour,
        topGenres: topGenres.slice(0, 3)
      },
      topGenres,
      topArtists,
      topTracks,
      listeningByHour: hourCount.map((count, hour) => ({ hour, count }))
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// MOOD JOURNAL
// ============================================

router.get('/users/mood-journal', protect, async (req, res) => {
  try {
    const rangeParam = req.query.range || '7';
    const rangeDays = parseInt(rangeParam, 10);
    const daysToUse = [7, 14, 30].includes(rangeDays) ? rangeDays : 7;

    const user = await User.findById(req.user.id).populate({
      path: 'recentlyPlayed.track',
      populate: { path: 'artist' }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.recentlyPlayed || user.recentlyPlayed.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const now = new Date();
    const fromDate = new Date();
    fromDate.setDate(now.getDate() - daysToUse + 1);

    const filtered = user.recentlyPlayed.filter((item) => {
      if (!item.playedAt) return false;
      const d = new Date(item.playedAt);
      return d >= fromDate && d <= now && item.track;
    });

    if (filtered.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const byDay = {};
    filtered.forEach((item) => {
      const d = new Date(item.playedAt);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD

      if (!byDay[key]) {
        byDay[key] = [];
      }
      byDay[key].push(item);
    });

    const moodEmojiMap = {
      happy: '😊',
      sad: '😔',
      energetic: '⚡',
      chill: '😌',
      focused: '🎯',
      party: '🎉'
    };

    const dayKeys = Object.keys(byDay).sort((a, b) => (a < b ? 1 : -1)); // от новых к старым

    const result = dayKeys.map((key) => {
      const items = byDay[key];

      const d = new Date(key + 'T00:00:00Z');
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      let label;
      if (isSameDay(d, today)) label = 'TODAY';
      else if (isSameDay(d, yesterday)) label = 'YESTERDAY';
      else
        label = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

      const moodCount = {};
      items.forEach((it) => {
        if (it.mood) {
          moodCount[it.mood] = (moodCount[it.mood] || 0) + 1;
        }
      });

      let topMood = '';
      if (Object.keys(moodCount).length > 0) {
        topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0][0];
      }

      const emoji = moodEmojiMap[topMood] || '🎵';

      const tracks = items.map((it) => ({
        _id: it.track._id,
        title: it.track.title,
        artistName: it.track.artist?.name || 'Unknown Artist',
        duration: it.track.duration,
        mood: it.mood || '',
        emoji: it.mood ? moodEmojiMap[it.mood] || '🎵' : '',
        playedAt: it.playedAt
      }));

      return {
        date: key,
        label,
        mood: topMood,
        emoji,
        tracksCount: items.length,
        tracks
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Mood journal error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;