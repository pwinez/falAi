import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import { logInfo, logWarning, logError, logSecurity } from '../utils/logger.js';

const router = express.Router();

// Kayıt ol
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      logWarning('Eksik kayıt bilgileri', { email });
      return res.status(400).json({ message: 'Email ve şifre gerekli' });
    }
    
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logWarning('Var olan email ile kayıt denemesi', { email });
      return res.status(400).json({ message: 'Bu email adresi zaten kayıtlı' });
    }
    
    // Şifre hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Yeni kullanıcı oluştur
    const user = new User({
      email,
      password: hashedPassword
    });
    
    await user.save();
    logInfo('Yeni kullanıcı kaydı başarılı', { userId: user._id, email });
    
    // Token oluştur
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    logError('Kayıt işlemi hatası', { error: error.message });
    res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu' });
  }
});

// Giriş yap
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      logWarning('Eksik giriş bilgileri', { email });
      return res.status(400).json({ message: 'Email ve şifre gerekli' });
    }
    
    // Kullanıcı kontrolü
    const user = await User.findOne({ email });
    if (!user) {
      logWarning('Başarısız giriş denemesi - Kullanıcı bulunamadı', { email });
      return res.status(401).json({ message: 'Email veya şifre hatalı' });
    }

    // Hesap durumu kontrolü
    if (user.status === 'blocked') {
      logSecurity('Engellenen hesap giriş denemesi', { 
        userId: user._id, 
        email: user.email,
        status: user.status 
      });
      return res.status(403).json({
        message: 'Hesabınız askıya alınmıştır. Daha fazla bilgi için support@falci.com adresinden bizimle iletişime geçebilirsiniz.',
        isBlocked: true
      });
    }
    
    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logWarning('Başarısız giriş denemesi - Yanlış şifre', { 
        userId: user._id, 
        email: user.email 
      });
      return res.status(401).json({ message: 'Email veya şifre hatalı' });
    }
    
    // Token oluştur
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Son giriş tarihini güncelle
    user.lastLoginDate = new Date();
    await user.save();
    
    logInfo('Başarılı giriş', { 
      userId: user._id, 
      email: user.email,
      role: user.role 
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        credits: user.credits,
        status: user.status
      }
    });
  } catch (error) {
    logError('Giriş işlemi hatası', { error: error.message });
    res.status(500).json({ message: 'Giriş sırasında bir hata oluştu' });
  }
});

// Kullanıcı bilgileri
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      logWarning('Kullanıcı bilgisi isteği - Kullanıcı bulunamadı', { userId: req.user.id });
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    logInfo('Kullanıcı bilgisi başarıyla alındı', { userId: user._id });
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      credits: user.credits,
      fortuneCount: user.fortuneCount
    });
  } catch (error) {
    logError('Kullanıcı bilgisi alma hatası', { error: error.message });
    res.status(500).json({ message: 'Kullanıcı bilgisi alınırken bir hata oluştu' });
  }
});

// Kullanıcı bilgilerini getir
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      logWarning('Kullanıcı bilgisi isteği - Kullanıcı bulunamadı', { userId: req.user.id });
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    logInfo('Kullanıcı bilgisi başarıyla alındı', { userId: user._id });
    res.json({
      id: user._id,
      email: user.email,
      credits: user.credits,
      fortuneCount: user.fortuneCount
    });
  } catch (error) {
    logError('Kullanıcı bilgisi alma hatası', { error: error.message });
    res.status(500).json({ message: 'Kullanıcı bilgisi alınırken bir hata oluştu' });
  }
});

// Fal geçmişi
router.get('/fortune-history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logWarning('Fal geçmişi isteği - Kullanıcı bulunamadı', { userId: req.user.id });
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    logInfo('Fal geçmişi başarıyla alındı', { 
      userId: user._id,
      fortuneCount: user.fortuneCount 
    });
    
    res.json({
      fortuneHistory: user.fortuneHistory,
      fortuneCount: user.fortuneCount
    });
  } catch (error) {
    logError('Fal geçmişi alma hatası', { error: error.message });
    res.status(500).json({ message: 'Fal geçmişi alınırken bir hata oluştu' });
  }
});

// Token yenileme
router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token gerekli' });
    }

    try {
      // Eski token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
      
      // Kullanıcıyı bul
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
      }

      // Yeni token oluştur
      const newToken = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          role: user.role,
          status: user.status
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logInfo('Token yenilendi', { userId: user._id });
      res.json({ newToken });
    } catch (error) {
      logError('Token yenileme hatası', { error: error.message });
      return res.status(401).json({ message: 'Geçersiz token' });
    }
  } catch (error) {
    logError('Token yenileme hatası', { error: error.message });
    res.status(500).json({ message: 'Token yenilenirken bir hata oluştu' });
  }
});

export default router; 