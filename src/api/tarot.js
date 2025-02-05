import express from 'express';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import { logInfo, logError } from '../utils/logger.js';
import { generateTarotReading } from '../services/geminiAI.js';

const router = express.Router();

// Tarot falı yorumu al
router.post('/reading', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Kredi kontrolü
    if (user.credits < 1) {
      return res.status(400).json({ message: 'Yetersiz kredi' });
    }

    const { cards } = req.body;
    if (!cards || !Array.isArray(cards) || cards.length !== 3) {
      return res.status(400).json({ message: 'Geçersiz kart seçimi' });
    }

    // Yapay zeka ile fal yorumu al
    const reading = await generateTarotReading(cards);

    // Kullanıcı kredisini düşür ve fal geçmişini güncelle
    user.credits -= 1;
    user.fortuneCount += 1;
    user.fortuneHistory.push({
      type: 'tarot',
      cards: cards,
      reading: reading,
      date: new Date()
    });

    await user.save();

    logInfo('Tarot falı bakıldı', {
      userId: user._id,
      cards: cards
    });

    res.json({
      reading,
      remainingCredits: user.credits
    });
  } catch (error) {
    logError('Tarot falı hatası', { error: error.message });
    res.status(500).json({ message: 'Fal yorumu alınırken bir hata oluştu' });
  }
});

export default router; 