import { Router } from 'express';

import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authLimiter, resendCodeLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/verify-email', authMiddleware, authController.verifyEmail);
router.post('/resend-code', resendCodeLimiter, authController.resendCode);
router.post('/forgot-password', resendCodeLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.get('/me', authMiddleware, authController.me);
router.patch('/me', authMiddleware, authController.updateName);
router.patch('/password', authMiddleware, authController.changePassword);
router.delete('/me', authMiddleware, authLimiter, authController.deleteAccount);
router.post('/logout', authController.logout);

export default router;
