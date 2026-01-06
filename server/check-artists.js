import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artist from './models/Artist.js';
import Track from './models/Track.js';

dotenv.config();

async function checkArtists() {
  console.log('[check-artists] вход');

  try {
    console.log('[check-artists] подключаемся к MongoDB');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[check-artists] MongoDB подключена');

    const artists = await Artist.find();
    console.log('[check-artists] артистов...', artists.length);

    for (let i = 0; i < artists.length; i = i + 1) {
      const artist = artists[i];
      console.log((i + 1) + '. ' + artist.name);
      console.log('   id: ' + artist._id.toString());
      console.log('   genres: ' + artist.genres.join(', '));
      console.log('');
    }

    const tracks = await Track.find().populate('artist');
    console.log('[check-artists] треков: ' + tracks.length);

    for (let i = 0; i < tracks.length; i = i + 1) {
      const track = tracks[i];

      let artistName = 'нет';
      let artistId = 'нет';

      if (track.artist) {
        if (track.artist.name) {
          artistName = track.artist.name;
        }

        if (track.artist._id) {
          artistId = track.artist._id.toString();
        }
      }

      console.log('"' + track.title + '"');
      console.log('   artist name: ' + artistName);
      console.log('   artist id: ' + artistId);
      console.log('');
    }

    console.log('[check-artists] закрываем соединение');
    await mongoose.connection.close();

    console.log('[check-artists] готово');
    process.exit(0);
  } catch (error) {
    console.log('[check-artists] ошибка');
    console.log(error);
    process.exit(1);
  }
}

checkArtists();
