import mongoose from 'mongoose';

const trackCommentSchema = new mongoose.Schema(
  {
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timeSec: {
      type: Number,
      required: true,
      min: 0
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export default mongoose.model('TrackComment', trackCommentSchema);