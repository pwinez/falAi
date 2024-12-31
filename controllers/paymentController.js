import iyzipay from '../config/iyzipay.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';

// Ödeme başlatma
export const initiatePayment = async (req, res) => {
  try {
    const { price, cardDetails, plan } = req.body;
    const user = req.user;

    const request = {
      locale: 'tr',
      conversationId: `${user._id}_${Date.now()}`,
      price: price.toString(),
      paidPrice: price.toString(),
      currency: 'TRY',
      installment: '1',
      basketId: `B${Date.now()}`,
      paymentChannel: 'WEB',
      paymentGroup: 'SUBSCRIPTION',
      paymentCard: {
        cardHolderName: cardDetails.cardHolderName,
        cardNumber: cardDetails.cardNumber,
        expireMonth: cardDetails.expireMonth,
        expireYear: cardDetails.expireYear,
        cvc: cardDetails.cvc,
        registerCard: '0'
      },
      buyer: {
        id: user._id.toString(),
        name: user.name,
        surname: user.name.split(' ').slice(-1)[0],
        email: user.email,
        identityNumber: '74300864791',
        registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        ip: req.ip,
        city: 'Istanbul',
        country: 'Turkey'
      },
      shippingAddress: {
        contactName: user.name,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1'
      },
      billingAddress: {
        contactName: user.name,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1'
      },
      basketItems: [
        {
          id: `SUBSCRIPTION_${plan.toUpperCase()}`,
          name: `${plan.toUpperCase()} Plan Subscription`,
          category1: 'Subscriptions',
          itemType: 'VIRTUAL',
          price: price.toString()
        }
      ]
    };

    iyzipay.payment.create(request, async function (err, result) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (result.status === 'success') {
        // Ödeme kaydı oluştur
        const payment = new Payment({
          user: user._id,
          amount: price,
          currency: 'TRY',
          status: 'completed',
          paymentMethod: 'credit_card',
          subscriptionPlan: plan,
          transactionId: result.paymentId
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
          paymentId: result.paymentId,
          subscription: user.subscription
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.errorMessage
        });
      }
    });
  } catch (error) {
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