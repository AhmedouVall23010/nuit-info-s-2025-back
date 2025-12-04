import mongoose from 'mongoose';

const councilPostSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  votes: {
    type: Number,
    default: 0,
    min: 0
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  taskType: {
    type: String,
    enum: ['repair', 'replace', 'privacy', 'learn', 'general'],
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
councilPostSchema.index({ createdAt: -1 });
councilPostSchema.index({ votes: -1 });

const CouncilPost = mongoose.model('CouncilPost', councilPostSchema);

export default CouncilPost;

