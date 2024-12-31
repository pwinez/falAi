import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const fortuneSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  reading: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive'
    },
    plan: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },
    validUntil: {
      type: Date
    },
    readings: {
      total: {
        type: Number,
        default: 0
      },
      remaining: {
        type: Number,
        default: 3 // Ücretsiz kullanıcılar için başlangıç hakkı
      }
    }
  },
  fortunes: [fortuneSchema],
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Şifre karşılaştırma hatası: ' + error.message);
  }
};

// Fal bakma hakkı kontrolü
userSchema.methods.canReadFortune = function() {
  if (this.subscription.status === 'active') {
    return this.subscription.readings.remaining > 0;
  }
  return false;
};

// Fal bakma hakkı kullanma
userSchema.methods.useReadingCredit = async function() {
  if (!this.canReadFortune()) {
    throw new Error('Fal bakma hakkınız kalmadı');
  }

  this.subscription.readings.remaining -= 1;
  this.subscription.readings.total += 1;
  await this.save();
};

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  
  next();
});

// Login kaydı ekleme
userSchema.methods.addLoginRecord = async function(ip, userAgent) {
  this.lastLogin = new Date();
  this.loginHistory.push({ ip, userAgent });
  
  // Sadece son 10 girişi tut
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  
  await this.save();
};

const User = mongoose.model('User', userSchema);

export default User; 