import { Payment } from '../models/Payment.mjs';
import { User } from '../models/User.mjs';

// Ödeme başlatma (Test modu)
export const initiatePayment = async (req, res) => {
  try {
    const { price, plan } = req.body;
    const user = req.user;

    // Test için direkt başarılı ödeme kaydı oluştur
    const payment = new Payment({
      user: user._id,
      amount: price,
      currency: 'TRY',
      status: 'completed',
      paymentMethod: 'test_payment',
      subscriptionPlan: plan,
      transactionId: `TEST_${Date.now()}`
    });
    await payment.save();

    // Kullanıcı aboneliğini güncelle
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1); // 1 aylık abonelik

    user.subscription = {
      status: 'active',
      plan: plan,
      validUntil: validUntil
    };
    await user.save();

    res.json({
      success: true,
      paymentId: payment.transactionId,
      subscription: user.subscription,
      message: 'Test modu: Ödeme otomatik olarak onaylandı'
    });
  } catch (error) {
    console.error('Ödeme hatası:', error);
    res.status(500).json({ error: 'Ödeme işlemi başarısız' });
  }
};

// Ödeme geçmişi
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Abonelik durumu
export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.subscription);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
}; 