import express from 'express';
import { check } from 'express-validator';
import { auth } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

// Kullanıcı route'ları
router.post('/register', [
  check('name', 'İsim gerekli').not().isEmpty(),
  check('email', 'Geçerli bir email adresi girin').isEmail(),
  check('password', 'Şifre en az 6 karakter olmalı').isLength({ min: 6 })
], userController.register);

router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/logout', auth, userController.logout);
router.get('/profile', auth, userController.getProfile);

// Ödeme route'ları
router.post('/payments/initiate', auth, paymentController.initiatePayment);
router.get('/payments/history', auth, paymentController.getPaymentHistory);
router.get('/subscription/status', auth, paymentController.getSubscriptionStatus);

export default router; 