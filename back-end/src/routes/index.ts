import { Router } from 'express';
import healthRoutes from './health';
import authRoutes from './auth';
import userRoutes from './users';
import roleRoutes from './roles';
import permissionRoutes from './permissions';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);

export default router;
