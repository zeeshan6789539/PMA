import { Router } from 'express';
import { check } from '@/controllers/healthController';

const router = Router();

router.get('/health', check);

export default router;
