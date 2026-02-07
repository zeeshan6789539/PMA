import { Router } from 'express';
import { signup, login, changePassword } from '@/controllers/auth-controller';
import { validate, authValidations } from '@/middleware/validation';
import { authenticate, requireSuperAdmin } from '@/middleware/auth';

const router = Router();

router.post('/signup', authValidations.signup, validate, authenticate, requireSuperAdmin, signup);
router.post('/login', authValidations.login, validate, login);
router.post('/change-password', authValidations.changePassword, validate, authenticate, changePassword);

export default router;
