import { Router } from 'express';
import {
  list,
  getById,
  create,
  update,
  remove,
} from '@/controllers/userController';
import { validate, userValidations } from '@/middleware/validation';
import { authenticate, requireSuperAdmin } from '@/middleware/auth';

const router = Router();
// Order: validation → authentication → authorization → handler
const guard = [authenticate, requireSuperAdmin];

router.get('/', userValidations.list, validate, ...guard, list);
router.get('/:id', userValidations.getById, validate, ...guard, getById);
router.post('/', userValidations.create, validate, ...guard, create);
router.put('/:id', userValidations.update, validate, ...guard, update);
router.delete('/:id', userValidations.remove, validate, ...guard, remove);

export default router;
