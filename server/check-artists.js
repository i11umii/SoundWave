import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artist from './models/Artist.js';
import Track from './models/Track.js';

dotenv.config();

const checkArtists = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const artists = await Artist.find();
    console.log('🎤 All Artists with IDs:');
    artists.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.name}`);
      console.log(`   ID: ${artist._id}`);
      console.log(`   Genres: ${artist.genres.join(', ')}`);
      console.log('');
    });

    const tracks = await Track.find().populate('artist');
    console.log('🎵 Tracks with Artist References:');
    tracks.forEach(track => {
      console.log(`"${track.title}"`);
      console.log(`   Artist Name: ${track.artist?.name}`);
      console.log(`   Artist ID: ${track.artist?._id}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Check complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkArtists();