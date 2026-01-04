
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Artist from '../models/Artist.js';
import Track from '../models/Track.js';
import Playlist from '../models/Playlist.js';
import Album from '../models/Album.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    await User.deleteMany({});
    await Artist.deleteMany({});
    await Track.deleteMany({});
    await Playlist.deleteMany({});
    await Album.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ← ХЕШИРУЕМ ПАРОЛЬ!
    const hashedPassword = await bcrypt.hash('demo123', 10);

    const demoUser = await User.create({
      username: 'demo',
      email: 'demo@soundwave.com',
      password: hashedPassword, // ← ИСПОЛЬЗУЕМ ХЕШ!
      bio: 'Music enthusiast and demo user',
      isPremium: true
    });
    console.log('👤 Demo user created');

    // Создание артистов
    const artistsData = [
      {
        name: 'The Midnight',
        bio: 'American synthwave band blending 80s aesthetics with modern production',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 8200000,
        followers: 2100000,
        genres: ['Synthwave', 'Electronic', 'Pop'],
        albums: [
          { title: 'Endless Summer', releaseYear: 2016, coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
          { title: 'Nocturnal', releaseYear: 2017, coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop' },
          { title: 'Kids', releaseYear: 2018, coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
          { title: 'Monsters', releaseYear: 2020, coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop' }
        ]
      },
      {
        name: 'Acoustic Dreams',
        bio: 'Solo acoustic artist creating peaceful melodies',
        imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 5400000,
        followers: 1200000,
        genres: ['Acoustic', 'Folk', 'Chill'],
        albums: [
          { title: 'Peaceful Moments', releaseYear: 2020, coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
          { title: 'Morning Coffee', releaseYear: 2021, coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop' }
        ]
      },
      {
        name: 'Electronic Vibes',
        bio: 'Electronic music producer pushing boundaries',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 3000000,
        followers: 800000,
        genres: ['Electronic', 'House', 'Techno'],
        albums: [
          { title: 'Digital Dreams', releaseYear: 2019, coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop' },
          { title: 'Future Bass', releaseYear: 2022, coverImage: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop' }
        ]
      },
      {
        name: 'Jazz Collective',
        bio: 'Contemporary jazz ensemble with classical influences',
        imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 2500000,
        followers: 650000,
        genres: ['Jazz', 'Soul', 'Blues'],
        albums: [
          { title: 'Midnight Sessions', releaseYear: 2018, coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop' },
          { title: 'Blue Notes', releaseYear: 2020, coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop' }
        ]
      },
      {
        name: 'Indie Waves',
        bio: 'Alternative indie rock band from California',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 4100000,
        followers: 950000,
        genres: ['Indie', 'Alternative', 'Rock'],
        albums: [
          { title: 'Coastal Vibes', releaseYear: 2019, coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
          { title: 'Sunset Boulevard', releaseYear: 2021, coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' }
        ]
      },
      {
        name: 'Lo-Fi Beats',
        bio: 'Chill beats for study and relaxation',
        imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 6800000,
        followers: 1500000,
        genres: ['Lo-fi', 'Chill', 'Hip-Hop'],
        albums: [
          { title: 'Study Sessions', releaseYear: 2020, coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop' },
          { title: 'Late Night Vibes', releaseYear: 2021, coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop' },
          { title: 'Focus Flow', releaseYear: 2022, coverImage: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop' }
        ]
      },
      {
        name: 'Classical Symphony',
        bio: 'Modern classical orchestra',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 1800000,
        followers: 450000,
        genres: ['Classical', 'Ambient'],
        albums: [
          { title: 'Symphonic Dreams', releaseYear: 2017, coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop' }
        ]
      },
      {
        name: 'R&B Smooth',
        bio: 'Contemporary R&B with soul influences',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 5200000,
        followers: 1100000,
        genres: ['R&B', 'Soul', 'Pop'],
        albums: [
          { title: 'Velvet Dreams', releaseYear: 2021, coverImage: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop' },
          { title: 'Night & Day', releaseYear: 2022, coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' }
        ]
      },
      {
        name: 'Hip Hop Legends',
        bio: 'Classic hip hop with modern beats',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 7200000,
        followers: 1800000,
        genres: ['Hip-Hop', 'Rap'],
        albums: [
          { title: 'Street Chronicles', releaseYear: 2020, coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop' }
        ]
      },
      {
        name: 'Rock Revival',
        bio: 'Modern rock with classic influences',
        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop',
        verified: true,
        monthlyListeners: 4500000,
        followers: 980000,
        genres: ['Rock', 'Alternative'],
        albums: [
          { title: 'Electric Storm', releaseYear: 2019, coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' }
        ]
      }
    ];
    // --- МАГИЧЕСКИЙ БЛОК НАЧАЛО ---
    const artists = []; // Этот массив нужен, чтобы код ниже (создание треков) не сломался
    const allCreatedAlbums = []; // Запоминаем альбомы, чтобы потом найти их для треков

    console.log('🔄 Converting data to new structure...');

    for (const data of artistsData) {
      // 1. Создаем Артиста (без альбомов пока)
      const artist = await Artist.create({
        name: data.name,
        bio: data.bio,
        imageUrl: data.imageUrl,
        coverImage: data.coverImage,
        verified: data.verified,
        monthlyListeners: data.monthlyListeners,
        followers: data.followers,
        genres: data.genres
      });

      // 2. Превращаем данные об альбомах в реальные документы Album
      if (data.albums && data.albums.length > 0) {
        const albumIds = [];
        for (const albData of data.albums) {
          const newAlbum = await Album.create({
            title: albData.title,
            artist: artist._id,
            coverUrl: albData.coverImage, // Мапим поля
            year: albData.releaseYear,    // Мапим поля
            genre: artist.genres[0],
            tracks: []
          });
          albumIds.push(newAlbum._id);
          allCreatedAlbums.push(newAlbum);
        }
        // Привязываем созданные альбомы к артисту
        artist.albums = albumIds;
        await artist.save();
      }
      artists.push(artist);
    }
    console.log(`🎤 Created ${artists.length} artists and ${allCreatedAlbums.length} albums`);
    // --- МАГИЧЕСКИЙ БЛОК КОНЕЦ ---

    console.log(`🎤 Created ${artists.length} artists`);

    // Создание БОЛЬШОГО количества треков (50+ треков)
    const tracks = await Track.insertMany([
      // Acoustic Dreams (10 треков)
      { title: 'Ukulele', artist: artists[1]._id, album: 'Peaceful Moments', duration: 146, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-ukulele.mp3', genre: 'Acoustic', playCount: 12500000, likes: 450000 },
      { title: 'Summer', artist: artists[1]._id, album: 'Morning Coffee', duration: 142, imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-summer.mp3', genre: 'Pop', playCount: 10200000, likes: 380000 },
      { title: 'Sunny', artist: artists[1]._id, album: 'Peaceful Moments', duration: 139, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3', genre: 'Acoustic', playCount: 9800000, likes: 350000 },
      { title: 'Acoustic Breeze', artist: artists[1]._id, album: 'Morning Coffee', duration: 140, imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3', genre: 'Acoustic', playCount: 6500000, likes: 250000 },
      { title: 'Once Again', artist: artists[1]._id, album: 'Peaceful Moments', duration: 161, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-onceagain.mp3', genre: 'Lo-fi', playCount: 5200000, likes: 210000 },
      { title: 'Happiness', artist: artists[1]._id, album: 'Morning Coffee', duration: 152, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-happiness.mp3', genre: 'Acoustic', playCount: 4800000, likes: 195000 },
      { title: 'Little Idea', artist: artists[1]._id, album: 'Peaceful Moments', duration: 127, imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-littleidea.mp3', genre: 'Acoustic', playCount: 4200000, likes: 180000 },
      { title: 'All That', artist: artists[1]._id, album: 'Morning Coffee', duration: 144, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-allthat.mp3', genre: 'Folk', playCount: 3900000, likes: 165000 },
      { title: 'Tomorrow', artist: artists[1]._id, album: 'Peaceful Moments', duration: 169, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-tomorrow.mp3', genre: 'Acoustic', playCount: 3600000, likes: 150000 },
      { title: 'A New Beginning', artist: artists[1]._id, album: 'Morning Coffee', duration: 156, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-anewbeginning.mp3', genre: 'Chill', playCount: 3300000, likes: 140000 },
      
      // The Midnight (8 треков)
      { title: 'Memories', artist: artists[0]._id, album: 'Endless Summer', duration: 225, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-memories.mp3', genre: 'Ambient', playCount: 8500000, likes: 320000 },
      { title: 'Creative Minds', artist: artists[0]._id, album: 'Nocturnal', duration: 148, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3', genre: 'Electronic', playCount: 7200000, likes: 290000 },
      { title: 'November', artist: artists[0]._id, album: 'Kids', duration: 198, imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-november.mp3', genre: 'Synthwave', playCount: 6800000, likes: 275000 },
      { title: 'Science', artist: artists[0]._id, album: 'Monsters', duration: 213, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-science.mp3', genre: 'Electronic', playCount: 5900000, likes: 245000 },
      { title: 'Elevate', artist: artists[0]._id, album: 'Endless Summer', duration: 177, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-elevate.mp3', genre: 'Synthwave', playCount: 5400000, likes: 230000 },
      { title: 'The Lounge', artist: artists[0]._id, album: 'Nocturnal', duration: 205, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-thelounge.mp3', genre: 'Ambient', playCount: 4700000, likes: 200000 },
      { title: 'Retro Soul', artist: artists[0]._id, album: 'Kids', duration: 192, imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-retrosoul.mp3', genre: 'Synthwave', playCount: 4200000, likes: 185000 },
      { title: 'The Jazz Piano', artist: artists[0]._id, album: 'Monsters', duration: 187, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-thejazzpiano.mp3', genre: 'Ambient', playCount: 3800000, likes: 165000 },
      
      // Electronic Vibes (7 треков)
      { title: 'Energy', artist: artists[2]._id, album: 'Digital Dreams', duration: 175, imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-energy.mp3', genre: 'Electronic', playCount: 5800000, likes: 230000 },
      { title: 'Funky Suspense', artist: artists[2]._id, album: 'Future Bass', duration: 187, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-funkysuspense.mp3', genre: 'Funk', playCount: 4200000, likes: 180000 },
      { title: 'Buddy', artist: artists[2]._id, album: 'Digital Dreams', duration: 122, imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-buddy.mp3', genre: 'Electronic', playCount: 3900000, likes: 170000 },
      { title: 'Dubstep', artist: artists[2]._id, album: 'Future Bass', duration: 158, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-dubstep.mp3', genre: 'Dubstep', playCount: 3600000, likes: 155000 },
      { title: 'Evolution', artist: artists[2]._id, album: 'Digital Dreams', duration: 198, imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-evolution.mp3', genre: 'House', playCount: 3300000, likes: 145000 },
      { title: 'Psychedelic', artist: artists[2]._id, album: 'Future Bass', duration: 211, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-psychedelic.mp3', genre: 'Electronic', playCount: 3000000, likes: 135000 },
      { title: 'Extreme Action', artist: artists[2]._id, album: 'Digital Dreams', duration: 177, imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-extremeaction.mp3', genre: 'Techno', playCount: 2800000, likes: 125000 },
      
      // Jazz Collective (5 треков)
      { title: 'Jazzy Frenchy', artist: artists[3]._id, album: 'Midnight Sessions', duration: 155, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3', genre: 'Jazz', playCount: 3800000, likes: 160000 },
      { title: 'Slow Motion', artist: artists[3]._id, album: 'Blue Notes', duration: 202, imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3', genre: 'Jazz', playCount: 3200000, likes: 140000 },
      { title: 'Jazzy Abstract Beat', artist: artists[3]._id, album: 'Midnight Sessions', duration: 149, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-jazzyabstractbeat.mp3', genre: 'Jazz', playCount: 2900000, likes: 130000 },
      { title: 'Straight', artist: artists[3]._id, album: 'Blue Notes', duration: 118, imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-straight.mp3', genre: 'Blues', playCount: 2600000, likes: 115000 },
      { title: 'New Dawn', artist: artists[3]._id, album: 'Midnight Sessions', duration: 165, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-newdawn.mp3', genre: 'Soul', playCount: 2300000, likes: 105000 },
      
      // Indie Waves (6 треков)
      { title: 'Going Higher', artist: artists[4]._id, album: 'Coastal Vibes', duration: 285, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-goinghigher.mp3', genre: 'Rock', playCount: 6200000, likes: 270000 },
      { title: 'Better Days', artist: artists[4]._id, album: 'Sunset Boulevard', duration: 148, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-betterdays.mp3', genre: 'Indie', playCount: 5500000, likes: 240000 },
      { title: 'Happy Rock', artist: artists[4]._id, album: 'Coastal Vibes', duration: 92, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-happyrock.mp3', genre: 'Rock', playCount: 5300000, likes: 240000 },
      { title: 'Perception', artist: artists[4]._id, album: 'Sunset Boulevard', duration: 197, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-perception.mp3', genre: 'Alternative', playCount: 4700000, likes: 215000 },
      { title: 'Inspire', artist: artists[4]._id, album: 'Coastal Vibes', duration: 145, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-inspire.mp3', genre: 'Indie', playCount: 4300000, likes: 195000 },
      { title: 'The Elevator', artist: artists[4]._id, album: 'Sunset Boulevard', duration: 131, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-theelevator.mp3', genre: 'Alternative', playCount: 3900000, likes: 175000 },
      
      // Lo-Fi Beats (8 треков)
      { title: 'Clear Day', artist: artists[5]._id, album: 'Study Sessions', duration: 129, imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-clearday.mp3', genre: 'Lo-fi', playCount: 8900000, likes: 380000 },
      { title: 'Dreams', artist: artists[5]._id, album: 'Late Night Vibes', duration: 215, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-dreams.mp3', genre: 'Ambient', playCount: 7800000, likes: 350000 },
      { title: 'Groovy Hip Hop', artist: artists[5]._id, album: 'Study Sessions', duration: 97, imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-groovyhiphop.mp3', genre: 'Hip-Hop', playCount: 6100000, likes: 280000 },
      { title: 'Hip Jazz', artist: artists[5]._id, album: 'Focus Flow', duration: 144, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-hipjazz.mp3', genre: 'Lo-fi', playCount: 5700000, likes: 260000 },
      { title: 'Moose', artist: artists[5]._id, album: 'Late Night Vibes', duration: 188, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-moose.mp3', genre: 'Chill', playCount: 5200000, likes: 240000 },
      { title: 'Relaxing', artist: artists[5]._id, album: 'Study Sessions', duration: 174, imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-relaxing.mp3', genre: 'Lo-fi', playCount: 4900000, likes: 225000 },
      { title: 'Little Planet', artist: artists[5]._id, album: 'Focus Flow', duration: 153, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-littleplanet.mp3', genre: 'Ambient', playCount: 4500000, likes: 210000 },
      { title: 'Sunny Day', artist: artists[5]._id, album: 'Late Night Vibes', duration: 162, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunnyday.mp3', genre: 'Chill', playCount: 4100000, likes: 190000 },
      
      // Classical Symphony (3 трека)
      { title: 'Piano Moment', artist: artists[6]._id, album: 'Symphonic Dreams', duration: 146, imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-pianomoment.mp3', genre: 'Classical', playCount: 2800000, likes: 120000 },
      { title: 'Romantic', artist: artists[6]._id, album: 'Symphonic Dreams', duration: 195, imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-romantic.mp3', genre: 'Classical', playCount: 2500000, likes: 110000 },
      { title: 'Cute', artist: artists[6]._id, album: 'Symphonic Dreams', duration: 128, imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-cute.mp3', genre: 'Ambient', playCount: 2200000, likes: 95000 },
      
      // R&B Smooth (4 трека)
      { title: 'Tenderness', artist: artists[7]._id, album: 'Velvet Dreams', duration: 193, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-tenderness.mp3', genre: 'R&B', playCount: 4700000, likes: 210000 },
      { title: 'Sweet', artist: artists[7]._id, album: 'Night & Day', duration: 298, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-sweet.mp3', genre: 'Soul', playCount: 4100000, likes: 190000 },
      { title: 'Love', artist: artists[7]._id, album: 'Velvet Dreams', duration: 154, imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-love.mp3', genre: 'R&B', playCount: 3700000, likes: 170000 },
      { title: 'Smoothjazz', artist: artists[7]._id, album: 'Night & Day', duration: 187, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-smoothjazz.mp3', genre: 'Soul', playCount: 3300000, likes: 155000 },
      
      // Hip Hop Legends (3 трека)
      { title: 'Hip Hop', artist: artists[8]._id, album: 'Street Chronicles', duration: 142, imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-hiphop.mp3', genre: 'Hip-Hop', playCount: 7500000, likes: 340000 },
      { title: 'Urban Vibes', artist: artists[8]._id, album: 'Street Chronicles', duration: 168, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-littleidea.mp3', genre: 'Rap', playCount: 6800000, likes: 310000 },
      { title: 'Street Life', artist: artists[8]._id, album: 'Street Chronicles', duration: 191, imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-groovyhiphop.mp3', genre: 'Hip-Hop', playCount: 6200000, likes: 285000 },
      
      // Rock Revival (3 трека)
      { title: 'Powerful', artist: artists[9]._id, album: 'Electric Storm', duration: 203, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-powerful.mp3', genre: 'Rock', playCount: 5600000, likes: 255000 },
      { title: 'Rock Angel', artist: artists[9]._id, album: 'Electric Storm', duration: 175, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-rockangel.mp3', genre: 'Rock', playCount: 5100000, likes: 235000 },
      { title: 'Epic', artist: artists[9]._id, album: 'Electric Storm', duration: 221, imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', audioUrl: 'https://www.bensound.com/bensound-music/bensound-epic.mp3', genre: 'Alternative', playCount: 4600000, likes: 210000 }
    ]);
    console.log(`🎵 Created ${tracks.length} tracks with genres and albums`);
    // --- СВЯЗЫВАНИЕ ТРЕКОВ НАЧАЛО ---
    console.log('🔗 Linking tracks to albums...');
    for (const track of tracks) {
      // Ищем альбом по названию (которое записано в track.album)
      // Используем массив allCreatedAlbums, который мы наполнили выше
      const album = allCreatedAlbums.find(a => a.title === track.album);

      if (album) {
        // 1. Добавляем трек в массив треков альбома
        album.tracks.push(track._id);
        await album.save();

        // 2. (Опционально) Если в схеме Track поле album это ObjectId, 
        // нам нужно обновить сам трек. Но у тебя в старом коде это String.
        // Если ты обновил модель Track.js на ref: 'Album', раскомментируй строку ниже:
        // await Track.findByIdAndUpdate(track._id, { album: album._id }); 
      }
    }
    // --- СВЯЗЫВАНИЕ ТРЕКОВ КОНЕЦ ---

    // Обновление связей артистов
    await Artist.findByIdAndUpdate(artists[0]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[0]._id.toString()).slice(0, 5).map(t => t._id),
      similarArtists: [artists[2]._id, artists[5]._id]
    });

    await Artist.findByIdAndUpdate(artists[1]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[1]._id.toString()).slice(0, 5).map(t => t._id),
      similarArtists: [artists[5]._id, artists[6]._id]
    });

    await Artist.findByIdAndUpdate(artists[2]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[2]._id.toString()).slice(0, 5).map(t => t._id),
      similarArtists: [artists[0]._id, artists[5]._id]
    });

    await Artist.findByIdAndUpdate(artists[3]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[3]._id.toString()).slice(0, 5).map(t => t._id),
      similarArtists: [artists[6]._id, artists[7]._id]
    });

    await Artist.findByIdAndUpdate(artists[4]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[4]._id.toString()).slice(0, 5).map(t => t._id),
      similarArtists: [artists[5]._id, artists[9]._id]
    });

    await Artist.findByIdAndUpdate(artists[5]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[5]._id.toString()).slice(0, 5).map(t => t._id),
      similarArtists: [artists[1]._id, artists[2]._id]
    });

    await Artist.findByIdAndUpdate(artists[6]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[6]._id.toString()).map(t => t._id),
      similarArtists: [artists[1]._id, artists[3]._id]
    });

    await Artist.findByIdAndUpdate(artists[7]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[7]._id.toString()).map(t => t._id),
      similarArtists: [artists[3]._id]
    });

    await Artist.findByIdAndUpdate(artists[8]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[8]._id.toString()).map(t => t._id),
      similarArtists: [artists[5]._id]
    });

    await Artist.findByIdAndUpdate(artists[9]._id, {
      topTracks: tracks.filter(t => t.artist.toString() === artists[9]._id.toString()).map(t => t._id),
      similarArtists: [artists[4]._id]
    });

    // Создание плейлистов
    const playlist1 = await Playlist.create({
      name: 'Chill Vibes',
      description: 'Relaxing tunes for a peaceful evening',
      user: demoUser._id,
      icon: 'fa-leaf',
      color: 'green',
      tracks: tracks.slice(0, 8).map((track, idx) => ({
        track: track._id,
        addedAt: new Date(Date.now() - (8 - idx) * 86400000)
      }))
    });

    const playlist2 = await Playlist.create({
      name: 'Workout Mix',
      description: 'High energy beats for your workout',
      user: demoUser._id,
      icon: 'fa-fire',
      color: 'red',
      tracks: tracks.filter(t => ['Rock', 'Hip-Hop', 'Electronic'].includes(t.genre)).slice(0, 6).map((track, idx) => ({
        track: track._id,
        addedAt: new Date(Date.now() - (6 - idx) * 86400000)
      }))
    });

    const playlist3 = await Playlist.create({
      name: 'Jazz & Soul',
      description: 'Smooth jazz and soulful melodies',
      user: demoUser._id,
      icon: 'fa-music',
      color: 'purple',
      tracks: tracks.filter(t => ['Jazz', 'Soul', 'R&B'].includes(t.genre)).slice(0, 5).map((track, idx) => ({
        track: track._id,
        addedAt: new Date(Date.now() - (5 - idx) * 86400000)
      }))
    });

    const playlist4 = await Playlist.create({
      name: 'Summer Hits',
      description: 'Feel the sun with these summer anthems',
      user: demoUser._id,
      icon: 'fa-sun',
      color: 'orange',
      tracks: tracks.filter(t => ['Pop', 'Indie', 'Acoustic'].includes(t.genre)).slice(0, 6).map((track, idx) => ({
        track: track._id,
        addedAt: new Date(Date.now() - (6 - idx) * 86400000)
      }))
    });

    // Расширенная история прослушивания
    const recentlyPlayed = [];
    const now = new Date();
    
    // Последние 14 дней
    for (let day = 0; day < 14; day++) {
      const tracksPerDay = Math.floor(Math.random() * 6) + 4; // 4-10 треков в день
      for (let i = 0; i < tracksPerDay; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(Math.floor(Math.random() * 24));
        date.setMinutes(Math.floor(Math.random() * 60));
        
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
        recentlyPlayed.push({
          track: randomTrack._id,
          playedAt: date
        });
      }
    }

    // Обновление пользователя
    await User.findByIdAndUpdate(demoUser._id, {
      playlists: [playlist1._id, playlist2._id, playlist3._id, playlist4._id],
      likedTracks: tracks.slice(0, 12).map(t => t._id),
      followedArtists: [artists[1]._id, artists[5]._id, artists[0]._id],
      recentlyPlayed: recentlyPlayed.sort((a, b) => b.playedAt - a.playedAt)
    });

    console.log(`📝 Created 4 playlists`);
    console.log('\n✅ Database seeded successfully with 50+ tracks!');
    console.log('\n📋 Demo User Credentials:');
    console.log('   Email: demo@soundwave.com');
    console.log('   Password: demo123\n');
    console.log(`🎤 Artists: ${artists.length}`);
    console.log(`🎵 Tracks: ${tracks.length}`);
    console.log(`💿 Total Albums: ${artists.reduce((sum, a) => sum + a.albums.length, 0)}`);
    console.log(`📊 Recently Played: ${recentlyPlayed.length} tracks`);
    console.log(`❤️  Liked Tracks: 12`);
    console.log(`👥 Followed Artists: 3\n`);

    console.log('🎵 Genres distribution:');
    const genreCount = {};
    tracks.forEach(t => {
      genreCount[t.genre] = (genreCount[t.genre] || 0) + 1;
    });
    Object.entries(genreCount).forEach(([genre, count]) => {
      console.log(`   ${genre}: ${count} tracks`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();