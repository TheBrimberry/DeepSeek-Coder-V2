import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { validate, registerSchema, loginSchema } from '../middleware/validation';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.get('/me', authenticate, AuthController.getProfile);
router.post('/verify-age', authenticate, AuthController.verifyAge);

export default router;
