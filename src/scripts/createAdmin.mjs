import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

// User şemasını burada tanımlayalım çünkü import etmek sorun çıkarabilir
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    readings: {
      total: {
        type: Number,
        default: 3
      },
      remaining: {
        type: Number,
        default: 3
      },
      used: {
        type: Number,
        default: 0
      }
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB\'ye bağlanıldı');

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    // Admin kullanıcısı oluştur
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@kahvefali.com',
      password: hashedPassword,
      role: 'admin',
      subscription: {
        type: 'premium',
        readings: {
          total: 999999,
          remaining: 999999,
          used: 0
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 365 * 24 * 60 * 60) // 1000 yıl
      }
    });

    // Kullanıcıyı kaydet
    await adminUser.save();
    console.log('Admin kullanıcısı başarıyla oluşturuldu');
    console.log('Email: admin@kahvefali.com');
    console.log('Şifre: Admin123!');

  } catch (error) {
    if (error.code === 11000) {
      console.log('Admin kullanıcısı zaten mevcut');
    } else {
      console.error('Hata:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

createAdmin(); 