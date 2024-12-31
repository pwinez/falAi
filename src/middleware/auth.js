import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı durumunu kontrol et
    if (user.status === 'blocked') {
      return res.status(403).json({
        message: 'Hesabınız askıya alınmıştır. Daha fazla bilgi için support@falci.com adresinden bizimle iletişime geçebilirsiniz.',
        isBlocked: true
      });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth Middleware Hatası:', error);
    res.status(401).json({ message: 'Yetkilendirme hatası' });
  }
};

// Admin middleware
export const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
    }
    next();
  } catch (error) {
    console.error('Admin Middleware Hatası:', error);
    res.status(403).json({ message: 'Yetkisiz erişim' });
  }
};

export default authMiddleware; 