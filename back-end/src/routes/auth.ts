import { Router } from 'express';
import { signup, login } from '@/controllers/auth-controller';
import { validate, authValidations } from '@/middleware/validation';

const router = Router();

router.post('/signup', authValidations.signup, validate, signup);
router.post('/login', authValidations.login, validate, login);

export default router;
