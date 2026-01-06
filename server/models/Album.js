import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  coverUrl: { type: String, required: true },
  year: { type: Number },
  genre: { type: String },
  description: { type: String },

  // Список треков, которые входят в альбом
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Album', albumSchema);
