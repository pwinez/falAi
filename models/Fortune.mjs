import mongoose from 'mongoose';

const fortuneSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  reading: {
    type: String,
    required: true
  },
  categories: {
    love: String,
    career: String,
    health: String,
    general: String
  },
  aiModel: {
    type: String,
    default: 'gpt-4-vision-preview'
  },
  readingTime: {
    type: Number, // ms cinsinden okuma süresi
    required: true
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    message: String,
    code: String,
    timestamp: Date
  },
  metadata: {
    userAgent: String,
    ip: String,
    platform: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Güncelleme tarihi middleware
fortuneSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

// İstatistik metodları
fortuneSchema.statics.getUserStats = async function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: null,
      totalReadings: { $sum: 1 },
      averageRating: { $avg: '$feedback.rating' },
      totalReadingTime: { $sum: '$readingTime' }
    }}
  ]);
};

const Fortune = mongoose.model('Fortune', fortuneSchema);

export default Fortune; 