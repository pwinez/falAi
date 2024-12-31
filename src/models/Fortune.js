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
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  readingType: {
    type: String,
    enum: ['coffee', 'tarot', 'general'],
    default: 'coffee'
  },
  credits: {
    type: Number,
    required: true,
    default: 1
  }
});

// Toplam fal sayısını getir
fortuneSchema.statics.getTotalReadings = async function() {
  return this.countDocuments({ status: 'completed' });
};

// Bugünün fallarını getir
fortuneSchema.statics.getDailyReadings = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.countDocuments({
    status: 'completed',
    createdAt: {
      $gte: today,
      $lt: tomorrow
    }
  });
};

// Son 7 günün fallarını getir
fortuneSchema.statics.getWeeklyReadings = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return this.countDocuments({
    status: 'completed',
    createdAt: {
      $gte: lastWeek,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });
};

// Kullanıcının fal geçmişini getir
fortuneSchema.statics.getUserReadings = async function(userId) {
  return this.find({ 
    userId,
    status: 'completed'
  }).sort({ createdAt: -1 });
};

// Günlük ortalama fal sayısını hesapla
fortuneSchema.statics.getAverageDailyReadings = async function() {
  const weeklyReadings = await this.getWeeklyReadings();
  return Math.round(weeklyReadings / 7);
};

const Fortune = mongoose.model('Fortune', fortuneSchema);

export default Fortune; 