import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  album: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true,
    enum: [
      'Pop', 
      'Rock', 
      'Hip-Hop', 
      'Rap',
      'Electronic', 
      'Jazz', 
      'Classical', 
      'R&B', 
      'Country', 
      'Reggae', 
      'Blues', 
      'Metal', 
      'Folk', 
      'Soul', 
      'Funk', 
      'Disco', 
      'House', 
      'Techno', 
      'Trance', 
      'Dubstep', 
      'Indie', 
      'Alternative', 
      'Punk', 
      'Acoustic', 
      'Lo-fi', 
      'Synthwave', 
      'Chill', 
      'Ambient'
    ]
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  playCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Track', trackSchema);