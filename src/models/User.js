import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },
  credits: {
    type: Number,
    default: 3
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    }
  },
  fortuneCount: {
    type: Number,
    default: 0
  },
  fortuneHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    content: String,
    imageUrl: String,
    type: {
      type: String,
      enum: ['coffee', 'tarot'],
      default: 'coffee'
    }
  }],
  paymentHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    type: {
      type: String,
      enum: ['credit', 'subscription'],
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending'
    },
    transactionId: String
  }],
  lastLoginDate: {
    type: Date,
    default: Date.now
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
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

export default User; 