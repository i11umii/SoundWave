import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  },
  monthlyListeners: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  genres: [{
    type: String
  }],
  albums: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],
  topTracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }],
  similarArtists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Artist', artistSchema);