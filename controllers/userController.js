import { User } from '../models/User.js';
import { Token } from '../models/Token.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// JWT token oluşturma fonksiyonu
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Refresh token oluşturma fonksiyonu
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Kullanıcı kaydı
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
    }

    // Yeni kullanıcı oluşturma
    const user = new User({
      name,
      email,
      password
    });

    // Token oluşturma
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.tokens.push({ token });
    await user.save();

    // Refresh token kaydetme
    await Token.create({
      user: user._id,
      token: refreshToken,
      type: 'refresh',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription
      },
      token,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı girişi
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.tokens.push({ token });
    await user.save();

    await Token.create({
      user: user._id,
      token: refreshToken,
      type: 'refresh',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription
      },
      token,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Token yenileme
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const tokenDoc = await Token.findOne({
      token: refreshToken,
      type: 'refresh',
      isValid: true
    });

    if (!tokenDoc) {
      return res.status(401).json({ error: 'Geçersiz refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Eski refresh token'ı geçersiz kılma
    tokenDoc.isValid = false;
    await tokenDoc.save();

    // Yeni refresh token oluşturma
    await Token.create({
      user: user._id,
      token: newRefreshToken,
      type: 'refresh',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    user.tokens.push({ token: newToken });
    await user.save();

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz token' });
  }
};

// Çıkış yapma
export const logout = async (req, res) => {
  try {
    const user = req.user;
    const token = req.token;

    user.tokens = user.tokens.filter((t) => t.token !== token);
    await user.save();

    res.json({ message: 'Başarıyla çıkış yapıldı' });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Kullanıcı profili
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      subscription: user.subscription
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
}; 