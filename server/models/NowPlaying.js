import mongoose from 'mongoose';

const nowPlayingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  track: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  message: {
    type: String,
    maxlength: 100,
    default: ''
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'energetic', 'chill', 'focused', 'party', ''],
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Автоудаление через 5 минут (300 секунд)
  }
}, {
  timestamps: true
});

nowPlayingSchema.index({ user: 1 });
nowPlayingSchema.index({ createdAt: 1 });

export default mongoose.model('NowPlaying', nowPlayingSchema);