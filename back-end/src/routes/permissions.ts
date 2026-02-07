import { Router } from 'express';
import {
  list,
  getById,
  create,
  update,
  remove,
} from '@/controllers/permissionController';
import { validate, permissionValidations } from '@/middleware/validation';
import { authenticate, requireSuperAdmin } from '@/middleware/auth';

const router = Router();
// Order: validation → authentication → authorization → handler
const guard = [authenticate, requireSuperAdmin];

router.get('/', permissionValidations.list, validate, ...guard, list);
router.get('/:id', permissionValidations.getById, validate, ...guard, getById);
router.post('/', permissionValidations.create, validate, ...guard, create);
router.put('/:id', permissionValidations.update, validate, ...guard, update);
router.delete('/:id', permissionValidations.remove, validate, ...guard, remove);

export default router;
