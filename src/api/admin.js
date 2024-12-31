import express from 'express';
import authMiddleware, { adminMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import { logAdmin, logError, logSecurity } from '../utils/logger.js';
import Fortune from '../models/Fortune.js';

const router = express.Router();

// Tüm kullanıcıları getir
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    logAdmin('Tüm kullanıcılar listelendi', { 
      adminId: req.user._id,
      userCount: users.length 
    });
    res.json(users);
  } catch (error) {
    logError('Kullanıcı listesi alma hatası', { error: error.message });
    res.status(500).json({ message: 'Kullanıcılar alınırken bir hata oluştu' });
  }
});

// Kullanıcı detaylarını getir
router.get('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      logError('Kullanıcı detayı alma hatası - Kullanıcı bulunamadı', { 
        adminId: req.user._id,
        targetUserId: req.params.userId 
      });
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    logAdmin('Kullanıcı detayları görüntülendi', { 
      adminId: req.user._id,
      targetUserId: user._id 
    });
    res.json(user);
  } catch (error) {
    logError('Kullanıcı detayı alma hatası', { error: error.message });
    res.status(500).json({ message: 'Kullanıcı detayları alınırken bir hata oluştu' });
  }
});

// Kullanıcı sil
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      logError('Kullanıcı silme hatası - Kullanıcı bulunamadı', { 
        adminId: req.user._id,
        targetUserId: req.params.userId 
      });
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    await user.remove();
    logAdmin('Kullanıcı silindi', { 
      adminId: req.user._id,
      targetUserId: user._id,
      targetUserEmail: user.email 
    });
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    logError('Kullanıcı silme hatası', { error: error.message });
    res.status(500).json({ message: 'Kullanıcı silinirken bir hata oluştu' });
  }
});

// Kullanıcı durumunu güncelle (engelle/engeli kaldır)
router.patch('/users/:userId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      logError('Kullanıcı durumu güncelleme hatası - Geçersiz durum', { 
        adminId: req.user._id,
        targetUserId: req.params.userId,
        status 
      });
      return res.status(400).json({ message: 'Geçersiz durum' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      logError('Kullanıcı durumu güncelleme hatası - Kullanıcı bulunamadı', { 
        adminId: req.user._id,
        targetUserId: req.params.userId 
      });
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.status = status;
    await user.save();

    logSecurity('Kullanıcı durumu güncellendi', { 
      adminId: req.user._id,
      targetUserId: user._id,
      targetUserEmail: user.email,
      oldStatus: user.status,
      newStatus: status 
    });

    res.json({ message: 'Kullanıcı durumu güncellendi', user });
  } catch (error) {
    logError('Kullanıcı durumu güncelleme hatası', { error: error.message });
    res.status(500).json({ message: 'Kullanıcı durumu güncellenirken bir hata oluştu' });
  }
});

// Kullanıcı rolünü güncelle
router.patch('/users/:userId/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      logError('Kullanıcı rolü güncelleme hatası - Geçersiz rol', { 
        adminId: req.user._id,
        targetUserId: req.params.userId,
        role 
      });
      return res.status(400).json({ message: 'Geçersiz rol' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      logError('Kullanıcı rolü güncelleme hatası - Kullanıcı bulunamadı', { 
        adminId: req.user._id,
        targetUserId: req.params.userId 
      });
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.role = role;
    await user.save();

    logAdmin('Kullanıcı rolü güncellendi', { 
      adminId: req.user._id,
      targetUserId: user._id,
      targetUserEmail: user.email,
      oldRole: user.role,
      newRole: role 
    });

    res.json({ message: 'Kullanıcı rolü güncellendi', user });
  } catch (error) {
    logError('Kullanıcı rolü güncelleme hatası', { error: error.message });
    res.status(500).json({ message: 'Kullanıcı rolü güncellenirken bir hata oluştu' });
  }
});

// Kullanıcı kredilerini güncelle
router.post('/update-credits', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, credits } = req.body;
    if (typeof credits !== 'number' || credits < 0) {
      logError('Kredi güncelleme hatası - Geçersiz kredi miktarı', { 
        adminId: req.user._id,
        targetUserId: userId,
        credits 
      });
      return res.status(400).json({ message: 'Geçersiz kredi miktarı' });
    }

    const user = await User.findById(userId);
    if (!user) {
      logError('Kredi güncelleme hatası - Kullanıcı bulunamadı', { 
        adminId: req.user._id,
        targetUserId: userId 
      });
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const oldCredits = user.credits;
    user.credits = credits;
    await user.save();

    logAdmin('Kullanıcı kredileri güncellendi', { 
      adminId: req.user._id,
      targetUserId: user._id,
      targetUserEmail: user.email,
      oldCredits,
      newCredits: credits 
    });

    res.json({ message: 'Krediler güncellendi', user });
  } catch (error) {
    logError('Kredi güncelleme hatası', { error: error.message });
    res.status(500).json({ message: 'Krediler güncellenirken bir hata oluştu' });
  }
});

// Admin istatistikleri
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Temel kullanıcı istatistikleri
    const [totalUsers, activeUsers, blockedUsers, premiumUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'blocked' }),
      User.countDocuments({ subscription: 'premium' })
    ]);

    // Fal istatistikleri
    const [totalReadings, dailyReadings, weeklyReadings] = await Promise.all([
      Fortune.getTotalReadings(),
      Fortune.getDailyReadings(),
      Fortune.getWeeklyReadings()
    ]);

    // Günlük ortalama hesaplama
    const averageDailyReadings = Math.round(weeklyReadings / 7);

    const stats = {
      totalUsers,
      activeUsers,
      blockedUsers,
      premiumUsers,
      totalReadings,
      dailyReadings,
      weeklyReadings,
      averageDailyReadings
    };

    // Log kaydı
    logAdmin('Admin istatistikleri görüntülendi', {
      adminId: req.user._id,
      stats
    });

    res.json(stats);
  } catch (error) {
    logError('İstatistik alma hatası', { error: error.message });
    res.status(500).json({ message: 'İstatistikler alınırken bir hata oluştu' });
  }
});

export default router; 