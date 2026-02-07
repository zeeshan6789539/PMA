import { Router } from 'express';
import { check } from '@/controllers/health-controller';

const router = Router();

router.get('/health', check);

export default router;
