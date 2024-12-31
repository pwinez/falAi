import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.mjs';
import apiRoutes from './routes/api.mjs';

// __dirname ve __filename ayarı
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env dosyasını yükle
dotenv.config({ path: join(__dirname, '.env.local') });

// MongoDB bağlantısı
await connectDB();

const app = express();

// CORS ayarları
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API route'ları
app.use('/api', apiRoutes);

// Test endpoint'i
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Detaylı hata yakalama
app.use((err, req, res, next) => {
  console.error('Hata detayları:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  res.status(500).json({ 
    error: 'Sunucu hatası',
    message: err.message 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log('Environment variables loaded:', {
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV
  });
}); 