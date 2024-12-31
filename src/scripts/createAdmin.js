import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion_tryon';

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
  credits: {
    type: Number,
    default: 3
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
    imageUrl: String
  }]
});

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB\'ye bağlandı');

    const User = mongoose.model('User', userSchema);

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        $set: {
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          credits: 999999
        }
      },
      { upsert: true, new: true }
    );

    console.log('Admin kullanıcısı oluşturuldu:', admin);
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
};

createAdmin(); 