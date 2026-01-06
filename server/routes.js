import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Track from './models/Track.js';
import Playlist from './models/Playlist.js';
import Artist from './models/Artist.js';
import Album from './models/Album.js';
import { protect } from './middleware/auth.js';

const router = express.Router();

function isValidObjectId(id) {
  if (!id) {
    return false;
  }

  return mongoose.Types.ObjectId.isValid(id);
}

router.post('/auth/register', async function (req, res) {
  console.log('[POST /auth/register] вход');

  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    console.log('[POST /auth/register] username =', username);
    console.log('[POST /auth/register] email =', email);

    if (!username || !email || !password) {
      console.log('[POST /auth/register] не хватает данных');
      return res.status(400).json({ message: 'Missing data' });
    }

    console.log('[POST /auth/register] ищем пользователя по email');
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      console.log('[POST /auth/register] пользователь уже существует');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('[POST /auth/register] хешируем пароль');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('[POST /auth/register] создаем пользователя');
    const user = await User.create({
      username: username,
      email: email,
      password: hashedPassword
    });

    console.log('[POST /auth/register] генерируем токен');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    console.log('[POST /auth/register] отправляем ответ');
    return res.json({
      success: true,
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        badges: user.badges
      }
    });
  } catch (error) {
    console.log('[POST /auth/register] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/auth/login', async function (req, res) {
  console.log('[POST /auth/login] вход');

  try {
    const email = req.body.email;
    const password = req.body.password;

    console.log('[POST /auth/login] email =', email);

    if (!email || !password) {
      console.log('[POST /auth/login] не хватает данных');
      return res.status(400).json({ message: 'Missing data' });
    }

    console.log('[POST /auth/login] ищем пользователя по email');
    const user = await User.findOne({ email: email }).select('+password');

    if (!user) {
      console.log('[POST /auth/login] пользователь не найден');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      console.log('[POST /auth/login] у пользователя нет хеша пароля');
      return res.status(500).json({ message: 'User data corrupted (no password set)' });
    }

    console.log('[POST /auth/login] сравниваем пароль');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('[POST /auth/login] пароль не совпал');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('[POST /auth/login] генерируем токен');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    console.log('[POST /auth/login] отправляем ответ');
    return res.json({
      success: true,
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        badges: user.badges
      }
    });
  } catch (error) {
    console.log('[POST /auth/login] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/auth/me', protect, async function (req, res) {
  console.log('[GET /auth/me] вход');

  try {
    const userId = req.user.id;
    console.log('[GET /auth/me] userId =', userId);

    console.log('[GET /auth/me] получаем пользователя из базы');
    const user = await User.findById(userId)
      .select('-password')
      .populate('badges')
      .populate('playlists')
      .populate({ path: 'recentlyPlayed.track', populate: { path: 'artist' } });

    if (!user) {
      console.log('[GET /auth/me] пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    let history = user.recentlyPlayed;
    if (!history) {
      history = [];
    }

    console.log('[GET /auth/me] считаем статистику');

    let totalSeconds = 0;
    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      const track = item.track;

      if (track) {
        const duration = track.duration;
        if (duration) {
          totalSeconds = totalSeconds + duration;
        }
      }
    }

    const hoursListened = Math.round(totalSeconds / 3600);

    const uniqueArtistIds = new Set();
    for (let i = 0; i < history.length; i = i + 1) {
      const item = history[i];
      const track = item.track;

      if (track) {
        const artist = track.artist;
        if (artist) {
          const artistId = artist._id;
          if (artistId) {
            uniqueArtistIds.add(artistId.toString());
          }
        }
      }
    }

    const uniqueArtists = uniqueArtistIds.size;

    let badges = user.badges;
    if (!badges) {
      badges = [];
    }

    let earlyListens = 0;
    for (let i = 0; i < badges.length; i = i + 1) {
      const badge = badges[i];
      if (badge && badge.id === 'EARLY_ADOPTER') {
        earlyListens = earlyListens + 1;
      }
    }

    let playlistsCount = 0;
    if (user.playlists) {
      playlistsCount = user.playlists.length;
    }

    const userData = user.toObject();
    userData.stats = {
      hoursListened: hoursListened,
      newArtistsDiscovered: uniqueArtists,
      earlyListens: earlyListens,
      playlistsCount: playlistsCount
    };

    console.log('[GET /auth/me] отправляем ответ');
    return res.json({ success: true, data: userData });
  } catch (error) {
    console.log('[GET /auth/me] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/search', async function (req, res) {
  console.log('[GET /users/search] вход');

  try {
    const query = req.query.q;
    console.log('[GET /users/search] q =', query);

    if (!query) {
      console.log('[GET /users/search] пустой запрос');
      return res.json({
        success: true,
        data: { tracks: [], artists: [], playlists: [] }
      });
    }

    const regex = new RegExp(query, 'i');

    console.log('[GET /users/search] ищем треки');
    const tracks = await Track.find({ title: regex }).populate('artist').limit(5);

    console.log('[GET /users/search] ищем артистов');
    const artists = await Artist.find({ name: regex }).limit(5);

    console.log('[GET /users/search] ищем плейлисты');
    const playlists = await Playlist.find({ name: regex }).limit(5);

    console.log('[GET /users/search] отправляем ответ');
    return res.json({ success: true, data: { tracks: tracks, artists: artists, playlists: playlists } });
  } catch (error) {
    console.log('[GET /users/search] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/artists', async function (req, res) {
  console.log('[GET /artists] вход');

  try {
    const artists = await Artist.find();
    console.log('[GET /artists] найдено артистов:', artists.length);
    return res.json({ success: true, data: artists });
  } catch (error) {
    console.log('[GET /artists] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/artists/:id', async function (req, res) {
  console.log('[GET /artists/:id] вход');

  try {
    const artistId = req.params.id;
    console.log('[GET /artists/:id] id =', artistId);

    if (!isValidObjectId(artistId)) {
      console.log('[GET /artists/:id] некорректный id');
      return res.status(404).json({ message: 'Artist not found' });
    }

    console.log('[GET /artists/:id] ищем артиста');
    const artist = await Artist.findById(artistId)
      .populate('albums')
      .populate({ path: 'topTracks', populate: { path: 'artist' } })
      .populate('similarArtists');

    if (!artist) {
      console.log('[GET /artists/:id] артист не найден');
      return res.status(404).json({ message: 'Artist not found' });
    }

    console.log('[GET /artists/:id] ищем треки артиста');
    const tracks = await Track.find({ artist: artist._id }).populate('artist');

    const artistData = artist.toObject();
    artistData.tracks = tracks;

    console.log('[GET /artists/:id] отправляем ответ');
    return res.json({ success: true, data: artistData });
  } catch (error) {
    console.log('[GET /artists/:id] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/artists/:id/follow', protect, async function (req, res) {
  console.log('[follow artist] start');

  try {
    const artistId = req.params.id;
    const userId = req.user.id || req.user._id;

    console.log('[follow artist] artistId =', artistId);
    console.log('[follow artist] userId =', userId);

    if (!artistId) {
      return res.status(400).json({ message: 'Missing artist id' });
    }

    // 1) проверяем что артист существует
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // 2) добавляем в user.followedArtists ТОЛЬКО если там ещё нет
    const result = await User.updateOne(
      { _id: userId, followedArtists: { $ne: artistId } },
      { $push: { followedArtists: artistId } }
    );

    console.log('[follow artist] user update result =', result);

    // 3) followers увеличиваем только если реально добавили
    const modified = result && (result.modifiedCount === 1 || result.nModified === 1);
    if (modified) {
      await Artist.updateOne({ _id: artistId }, { $inc: { followers: 1 } });
      console.log('[follow artist] followers +1');
    } else {
      console.log('[follow artist] already followed, followers not changed');
    }

    return res.json({ success: true });
  } catch (error) {
    console.log('[follow artist] error');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/artists/:id/follow', protect, async function (req, res) {
  console.log('[unfollow artist] start');

  try {
    const artistId = req.params.id;
    const userId = req.user.id || req.user._id;

    console.log('[unfollow artist] artistId =', artistId);
    console.log('[unfollow artist] userId =', userId);

    if (!artistId) {
      return res.status(400).json({ message: 'Missing artist id' });
    }

    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // 1) удаляем из массива ТОЛЬКО если он там был
    const result = await User.updateOne(
      { _id: userId, followedArtists: artistId },
      { $pull: { followedArtists: artistId } }
    );

    console.log('[unfollow artist] user update result =', result);

    // 2) followers уменьшаем только если реально удалили
    const modified = result && (result.modifiedCount === 1 || result.nModified === 1);
    if (modified) {
      await Artist.updateOne({ _id: artistId }, { $inc: { followers: -1 } });
      // страховка от минуса
      await Artist.updateOne({ _id: artistId }, { $max: { followers: 0 } });

      console.log('[unfollow artist] followers -1');
    } else {
      console.log('[unfollow artist] was not followed, followers not changed');
    }

    return res.json({ success: true });
  } catch (error) {
    console.log('[unfollow artist] error');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/followed-artists', protect, async function (req, res) {
  console.log('[GET /users/followed-artists] вход');

  try {
    console.log('[GET /users/followed-artists] userId =', req.user.id);

    const user = await User.findById(req.user.id).populate('followedArtists');

    if (!user) {
      console.log('[GET /users/followed-artists] пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('[GET /users/followed-artists] отправляем ответ');
    return res.json({ success: true, data: user.followedArtists });
  } catch (error) {
    console.log('[GET /users/followed-artists] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/tracks', async function (req, res) {
  console.log('[GET /tracks] вход');

  try {
    const tracks = await Track.find().populate('artist');
    console.log('[GET /tracks] найдено треков:', tracks.length);
    return res.json({ success: true, data: tracks });
  } catch (error) {
    console.log('[GET /tracks] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/tracks/recommendations', protect, async function (req, res) {
  console.log('[GET /tracks/recommendations] вход');

  try {
    console.log('[GET /tracks/recommendations] userId =', req.user.id);

    const user = await User.findById(req.user.id).populate('recentlyPlayed.track');

    if (!user) {
      console.log('[GET /tracks/recommendations] пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    let recentlyPlayed = user.recentlyPlayed;
    if (!recentlyPlayed) {
      recentlyPlayed = [];
    }

    // Собираем ID уже прослушанных треков
    const playedIds = [];
    for (let i = 0; i < recentlyPlayed.length; i = i + 1) {
      const item = recentlyPlayed[i];
      const track = item.track;
      if (track && track._id) {
        playedIds.push(track._id);
      }
    }

    // Собираем последние треки, у которых есть жанр
    const withGenre = [];
    for (let i = 0; i < recentlyPlayed.length; i = i + 1) {
      const item = recentlyPlayed[i];
      const track = item.track;

      if (track) {
        const genre = track.genre;
        if (genre) {
          withGenre.push(item);
        }
      }
    }

    let startIndex = 0;
    if (withGenre.length > 50) {
      startIndex = withGenre.length - 50;
    }

    const lastTracks = [];
    for (let i = startIndex; i < withGenre.length; i = i + 1) {
      lastTracks.push(withGenre[i]);
    }

    // Считаем, сколько раз встречается каждый жанр
    const genreCounts = {};
    for (let i = 0; i < lastTracks.length; i = i + 1) {
      const item = lastTracks[i];
      const track = item.track;
      const genre = track.genre;

      const current = genreCounts[genre];
      if (current) {
        genreCounts[genre] = current + 1;
      } else {
        genreCounts[genre] = 1;
      }
    }

    // Ищем самый частый жанр
    let favoriteGenre = null;
    let maxCount = 0;

    const genreEntries = Object.entries(genreCounts);
    for (let i = 0; i < genreEntries.length; i = i + 1) {
      const entry = genreEntries[i];
      const genre = entry[0];
      const count = entry[1];

      if (count > maxCount) {
        maxCount = count;
        favoriteGenre = genre;
      }
    }

    console.log('[GET /tracks/recommendations] favoriteGenre =', favoriteGenre);

    // Ищем новые треки, которых нет в playedIds
    const query = { _id: { $nin: playedIds } };
    if (favoriteGenre) {
      query.genre = favoriteGenre;
    }

    let recommendations = await Track.find(query).populate('artist').limit(10);

    // Если треков мало, добираем популярные
    if (recommendations.length < 10) {
      const currentRecIds = recommendations.map(function (t) {
        return t._id;
      });

      const moreTracks = await Track.find({
        _id: { $nin: currentRecIds }
      })
        .sort({ playCount: -1 })
        .populate('artist')
        .limit(10 - recommendations.length);

      for (let i = 0; i < moreTracks.length; i = i + 1) {
        recommendations.push(moreTracks[i]);
      }
    }

    console.log('[GET /tracks/recommendations] рекомендаций:', recommendations.length);
    return res.json({ success: true, data: recommendations });
  } catch (error) {
    console.log('[GET /tracks/recommendations] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/users/me', protect, async function (req, res) {
  console.log('[PATCH /users/me] вход');

  try {
    const userId = req.user.id;
    console.log('[PATCH /users/me] userId =', userId);

    const user = await User.findById(userId);

    if (!user) {
      console.log('[PATCH /users/me] пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    const newUsername = req.body.username;
    const newBio = req.body.bio;

    if (newUsername) {
      user.username = newUsername;
    }

    if (newBio) {
      user.bio = newBio;
    }

    console.log('[PATCH /users/me] сохраняем пользователя');
    const updatedUser = await user.save();

    console.log('[PATCH /users/me] отправляем ответ');
    return res.json({
      success: true,
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        badges: updatedUser.badges
      }
    });
  } catch (error) {
    console.log('[PATCH /users/me] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/liked-tracks', protect, async function (req, res) {
  console.log('[GET /users/liked-tracks] вход');

  try {
    console.log('[GET /users/liked-tracks] userId =', req.user.id);

    const user = await User.findById(req.user.id).populate({
      path: 'likedTracks',
      populate: { path: 'artist' }
    });

    if (!user) {
      console.log('[GET /users/liked-tracks] пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('[GET /users/liked-tracks] likedTracks =', user.likedTracks.length);
    return res.json({ success: true, data: user.likedTracks });
  } catch (error) {
    console.log('[GET /users/liked-tracks] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users/like/:id', protect, async function (req, res) {
  console.log('[POST /users/like/:id] вход');

  try {
    const user = await User.findById(req.user.id);
    const trackId = req.params.id;

    console.log('[POST /users/like/:id] userId =', req.user.id);
    console.log('[POST /users/like/:id] trackId =', trackId);

    if (!user) {
      console.log('[POST /users/like/:id] пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    let isAlreadyLiked = false;
    for (let i = 0; i < user.likedTracks.length; i = i + 1) {
      const id = user.likedTracks[i];
      if (id && id.toString() === trackId) {
        isAlreadyLiked = true;
        break;
      }
    }

    if (isAlreadyLiked) {
      console.log('[POST /users/like/:id] удаляем лайк');

      user.likedTracks = user.likedTracks.filter(function (id) {
        return id.toString() !== trackId;
      });

      await Track.findByIdAndUpdate(trackId, { $inc: { likes: -1 } });
    } else {
      console.log('[POST /users/like/:id] добавляем лайк');

      user.likedTracks.push(trackId);
      await Track.findByIdAndUpdate(trackId, { $inc: { likes: 1 } });
    }

    await user.save();
    return res.json({ success: true, likedTracks: user.likedTracks });
  } catch (error) {
    console.log('[POST /users/like/:id] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/recently-played', protect, async function (req, res) {
  console.log('[GET /users/recently-played] вход');

  try {
    const user = await User.findById(req.user.id).populate({
      path: 'recentlyPlayed.track',
      populate: { path: 'artist' }
    });

    if (!user) {
      console.log('[GET /users/recently-played] пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    const history = user.recentlyPlayed.sort(function (a, b) {
      return new Date(b.playedAt) - new Date(a.playedAt);
    });

    return res.json({ success: true, data: history });
  } catch (error) {
    console.log('[GET /users/recently-played] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users/recently-played/:id', protect, async function (req, res) {
  console.log('[POST /users/recently-played/:id] вход');

  try {
    const user = await User.findById(req.user.id);
    const trackId = req.params.id;

    console.log('[POST /users/recently-played/:id] userId =', req.user.id);
    console.log('[POST /users/recently-played/:id] trackId =', trackId);

    if (!user) {
      console.log('[POST /users/recently-played/:id] пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    const track = await Track.findById(trackId);

    if (!track) {
      console.log('[POST /users/recently-played/:id] трек не найден');
      return res.status(404).json({ message: 'Track not found' });
    }

    user.recentlyPlayed.push({ track: track._id, playedAt: new Date() });

    const currentPlayCount = track.playCount || 0;
    track.playCount = currentPlayCount + 1;
    await track.save();

    let newBadge = null;

    if (track.playCount < 1000) {
      const hasBadge = user.badges.find(function (b) {
        return b.id === 'EARLY_ADOPTER';
      });

      if (!hasBadge) {
        newBadge = {
          id: 'EARLY_ADOPTER',
          name: 'Trendsetter',
          icon: '💎',
          description: 'Discovered a hidden gem!',
          earnedAt: new Date()
        };
        user.badges.push(newBadge);
      }
    }

    await user.save();
    return res.json({ success: true, newBadge: newBadge });
  } catch (error) {
    console.log('[POST /users/recently-played/:id] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/playlists', protect, async function (req, res) {
  console.log('[GET /playlists] вход');

  try {
    const playlists = await Playlist.find({ user: req.user.id });
    console.log('[GET /playlists] найдено плейлистов:', playlists.length);
    return res.json({ success: true, data: playlists });
  } catch (error) {
    console.log('[GET /playlists] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/playlists/:id', protect, async function (req, res) {
  console.log('[GET /playlists/:id] вход');

  try {
    const playlistId = req.params.id;
    console.log('[GET /playlists/:id] id =', playlistId);

    if (!isValidObjectId(playlistId)) {
      console.log('[GET /playlists/:id] некорректный id');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const playlist = await Playlist.findById(playlistId).populate({
      path: 'tracks.track',
      populate: { path: 'artist' }
    });

    if (!playlist) {
      console.log('[GET /playlists/:id] плейлист не найден');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    return res.json({ success: true, data: playlist });
  } catch (error) {
    console.log('[GET /playlists/:id] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/playlists', protect, async function (req, res) {
  console.log('[POST /playlists] вход');

  try {
    const body = req.body;

    const playlistData = {};
    const keys = Object.keys(body);
    for (let i = 0; i < keys.length; i = i + 1) {
      const key = keys[i];
      playlistData[key] = body[key];
    }

    playlistData.user = req.user.id;

    console.log('[POST /playlists] создаем плейлист');
    const playlist = await Playlist.create(playlistData);

    console.log('[POST /playlists] добавляем плейлист в пользователя');
    await User.findByIdAndUpdate(req.user.id, { $push: { playlists: playlist._id } });

    return res.json({ success: true, data: playlist });
  } catch (error) {
    console.log('[POST /playlists] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/playlists/:id', protect, async function (req, res) {
  console.log('[PATCH /playlists/:id] вход');

  try {
    const playlistId = req.params.id;
    const name = req.body.name;

    console.log('[PATCH /playlists/:id] id =', playlistId);
    console.log('[PATCH /playlists/:id] name =', name);

    if (!isValidObjectId(playlistId)) {
      console.log('[PATCH /playlists/:id] некорректный id');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (!name) {
      console.log('[PATCH /playlists/:id] не передано имя');
      return res.status(400).json({ message: 'Missing name' });
    }

    const trimmedName = String(name).trim();
    if (!trimmedName) {
      console.log('[PATCH /playlists/:id] имя пустое после trim');
      return res.status(400).json({ message: 'Missing name' });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      console.log('[PATCH /playlists/:id] плейлист не найден');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.user.toString() !== req.user.id) {
      console.log('[PATCH /playlists/:id] нет доступа');
      return res.status(401).json({ message: 'Not authorized' });
    }

    playlist.name = trimmedName;

    console.log('[PATCH /playlists/:id] сохраняем плейлист');
    await playlist.save();

    return res.json({ success: true, data: playlist });
  } catch (error) {
    console.log('[PATCH /playlists/:id] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/playlists/:id', protect, async function (req, res) {
  console.log('[DELETE /playlists/:id] вход');

  try {
    const playlistId = req.params.id;
    console.log('[DELETE /playlists/:id] id =', playlistId);

    if (!isValidObjectId(playlistId)) {
      console.log('[DELETE /playlists/:id] некорректный id');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      console.log('[DELETE /playlists/:id] плейлист не найден');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.user.toString() !== req.user.id) {
      console.log('[DELETE /playlists/:id] нет доступа');
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Playlist.findByIdAndDelete(playlistId);
    await User.findByIdAndUpdate(req.user.id, { $pull: { playlists: playlistId } });

    return res.json({ success: true, message: 'Playlist removed' });
  } catch (error) {
    console.log('[DELETE /playlists/:id] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/playlists/:id/tracks', protect, async function (req, res) {
  console.log('[POST /playlists/:id/tracks] вход');

  try {
    const playlistId = req.params.id;
    const trackId = req.body.trackId;

    console.log('[POST /playlists/:id/tracks] playlistId =', playlistId);
    console.log('[POST /playlists/:id/tracks] trackId =', trackId);

    if (!isValidObjectId(playlistId)) {
      console.log('[POST /playlists/:id/tracks] некорректный playlistId');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      console.log('[POST /playlists/:id/tracks] плейлист не найден');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.user.toString() !== req.user.id) {
      console.log('[POST /playlists/:id/tracks] нет доступа');
      return res.status(401).json({ message: 'Not authorized' });
    }

    let alreadyInPlaylist = false;
    for (let i = 0; i < playlist.tracks.length; i = i + 1) {
      const t = playlist.tracks[i];
      if (t && t.track && t.track.toString() === trackId) {
        alreadyInPlaylist = true;
        break;
      }
    }

    if (alreadyInPlaylist) {
      console.log('[POST /playlists/:id/tracks] трек уже есть в плейлисте');
      return res.status(400).json({ message: 'Track already in playlist' });
    }

    playlist.tracks.push({ track: trackId, addedAt: new Date() });
    await playlist.save();

    return res.json({ success: true, data: playlist });
  } catch (error) {
    console.log('[POST /playlists/:id/tracks] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/playlists/:id/tracks/:trackId', protect, async function (req, res) {
  console.log('[DELETE /playlists/:id/tracks/:trackId] вход');

  try {
    const playlistId = req.params.id;
    const trackId = req.params.trackId;

    console.log('[DELETE /playlists/:id/tracks/:trackId] playlistId =', playlistId);
    console.log('[DELETE /playlists/:id/tracks/:trackId] trackId =', trackId);

    if (!isValidObjectId(playlistId)) {
      console.log('[DELETE /playlists/:id/tracks/:trackId] некорректный playlistId');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      console.log('[DELETE /playlists/:id/tracks/:trackId] плейлист не найден');
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.user.toString() !== req.user.id) {
      console.log('[DELETE /playlists/:id/tracks/:trackId] нет доступа');
      return res.status(401).json({ message: 'Not authorized' });
    }

    playlist.tracks = playlist.tracks.filter(function (t) {
      return t.track.toString() !== trackId;
    });

    await playlist.save();
    return res.json({ success: true, data: playlist });
  } catch (error) {
    console.log('[DELETE /playlists/:id/tracks/:trackId] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/smart-stats', protect, async function (req, res) {
  console.log('[GET /smart-stats] вход');

  try {
    const user = await User.findById(req.user.id).populate({
      path: 'recentlyPlayed.track',
      populate: { path: 'artist' }
    });

    if (!user) {
      console.log('[GET /smart-stats] пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    let history = user.recentlyPlayed;
    if (!history) {
      history = [];
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCount = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    for (let i = 0; i < history.length; i = i + 1) {
      const item = history[i];
      const date = new Date(item.playedAt);
      const dayIndex = date.getDay();
      const dayName = days[dayIndex];

      const current = dayCount[dayName];
      dayCount[dayName] = current + 1;
    }

    const artistMap = {};
    for (let i = 0; i < history.length; i = i + 1) {
      const item = history[i];
      const track = item.track;

      if (track) {
        const artist = track.artist;
        if (artist) {
          const artistName = artist.name;

          const current = artistMap[artistName];
          if (current) {
            artistMap[artistName] = current + 1;
          } else {
            artistMap[artistName] = 1;
          }
        }
      }
    }

    const entries = Object.entries(artistMap);
    entries.sort(function (a, b) {
      return b[1] - a[1];
    });

    const topArtists = [];
    let topLimit = 5;
    if (entries.length < 5) {
      topLimit = entries.length;
    }

    for (let i = 0; i < topLimit; i = i + 1) {
      const entry = entries[i];
      topArtists.push({ name: entry[0], count: entry[1] });
    }

    const insights = [];

    if (history.length > 0) {
      let favoriteDay = null;
      let maxValue = -1;

      const dayKeys = Object.keys(dayCount);
      for (let i = 0; i < dayKeys.length; i = i + 1) {
        const dayKey = dayKeys[i];
        const value = dayCount[dayKey];

        if (value > maxValue) {
          maxValue = value;
          favoriteDay = dayKey;
        }
      }

      if (favoriteDay) {
        insights.push({
          type: 'energy',
          icon: '📅',
          text: 'Most active on: ' + favoriteDay,
          value: dayCount[favoriteDay]
        });
      }
    }

    if (history.length > 5) {
      insights.push({
        type: 'artist',
        icon: '🎵',
        text: 'Total plays: ' + history.length,
        value: history.length
      });
    }

    const dayStats = [];
    const dayKeys = Object.keys(dayCount);
    for (let i = 0; i < dayKeys.length; i = i + 1) {
      const dayKey = dayKeys[i];
      dayStats.push({ day: dayKey, count: dayCount[dayKey] });
    }

    return res.json({
      success: true,
      data: {
        insights: insights,
        topArtists: topArtists,
        dayStats: dayStats
      }
    });
  } catch (error) {
    console.log('[GET /smart-stats] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/albums/:id', async function (req, res) {
  console.log('[GET /albums/:id] вход');

  try {
    const albumId = req.params.id;
    console.log('[GET /albums/:id] id =', albumId);

    if (!isValidObjectId(albumId)) {
      console.log('[GET /albums/:id] некорректный id');
      return res.status(404).json({ message: 'Album not found' });
    }

    const album = await Album.findById(albumId)
      .populate('artist')
      .populate({
        path: 'tracks',
        populate: { path: 'artist' }
      });

    if (!album) {
      console.log('[GET /albums/:id] альбом не найден');
      return res.status(404).json({ message: 'Album not found' });
    }

    return res.json({ success: true, data: album });
  } catch (error) {
    console.log('[GET /albums/:id] ошибка');
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
