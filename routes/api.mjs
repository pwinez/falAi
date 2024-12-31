import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.mjs';

const router = express.Router();

// Test endpoint'i
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Kayıt olma route'u
router.post('/register', [
  check('name', 'İsim gerekli').notEmpty(),
  check('email', 'Geçerli bir email adresi girin').isEmail(),
  check('password', 'Şifre en az 6 karakter olmalı').isLength({ min: 6 })
], async (req, res) => {
  console.log('Register isteği alındı:', req.body);
  
  try {
    // Validasyon kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Email kontrolü
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
    }

    // Yeni kullanıcı oluşturma
    user = new User({
      name,
      email,
      password
    });

    // Şifreyi hashleme ve kaydetme
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // JWT token oluşturma
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Kullanıcı başarıyla kaydedildi:', {
      id: user.id,
      name: user.name,
      email: user.email
    });

    res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi',
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası: ' + error.message
    });
  }
});

// Login route'u
router.post('/login', [
  check('email', 'Geçerli bir email adresi girin').isEmail(),
  check('password', 'Şifre gerekli').exists()
], async (req, res) => {
  console.log('Login isteği alındı:', { email: req.body.email });
  
  try {
    // Validasyon kontrolü
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Geçersiz email veya şifre' });
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Geçersiz email veya şifre' });
    }

    // JWT token oluştur
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Kullanıcı başarıyla giriş yaptı:', {
      id: user.id,
      name: user.name,
      email: user.email
    });

    res.json({
      message: 'Giriş başarılı',
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası: ' + error.message
    });
  }
});

// Token yenileme route'u
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token gerekli' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    const newToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token yenileme hatası:', error);
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
});

// Profil güncelleme route'u
router.put('/profile', auth, [
  check('name', 'İsim gerekli').notEmpty(),
  check('email', 'Geçerli bir email adresi girin').isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email } = req.body;
    const userId = req.user.id;

    // Email değişiyorsa, yeni email'in başka kullanıcı tarafından kullanılmadığını kontrol et
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
      }
    }

    // Kullanıcıyı güncelle
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name, email } },
      { new: true, select: '-password' }
    );

    res.json({
      message: 'Profil başarıyla güncellendi',
      user
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
});

// Şifre değiştirme route'u
router.put('/profile/password', auth, [
  check('currentPassword', 'Mevcut şifre gerekli').notEmpty(),
  check('newPassword', 'Yeni şifre en az 6 karakter olmalı').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Mevcut şifreyi kontrol et
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mevcut şifre yanlış' });
    }

    // Yeni şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
});

// Güvenli çıkış route'u
router.post('/logout', auth, async (req, res) => {
  try {
    // Kullanıcının refresh token'ını sil
    const user = await User.findById(req.user.id);
    if (user) {
      user.tokens = user.tokens.filter(token => token.token !== req.token);
      await user.save();
    }

    res.json({ message: 'Başarıyla çıkış yapıldı' });
  } catch (error) {
    console.error('Çıkış hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
});

export default router; 