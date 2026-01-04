import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  // Music DNA - statystyki uzytkownika
  musicDNA: {
    personality: { type: String, default: 'Casual Listener' },
    listeningTime: { type: String, default: 'Day Listener' },
    topMood: { type: String, default: 'Chill' },
    earlyAdopter: { type: Boolean, default: false }
  },
  // === NEW: Gamification Badges ===
  badges: [{
    id: String,         // np. 'EARLY_ADOPTER'
    name: String,       // 'Trendsetter'
    icon: String,       // '🚀'
    description: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  // ================================
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likedTracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }],
  followedArtists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  }],
  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  }],
  recentlyPlayed: [{
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track'
    },
    playedAt: {
      type: Date,
      default: Date.now
    },
    mood: {
      type: String,
      default: ''
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);