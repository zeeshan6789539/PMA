import { Router } from 'express';
import {
  list,
  getById,
  create,
  update,
  remove,
  assignPermissions,
  removePermissions,
} from '@/controllers/role-controller';
import { validate, roleValidations } from '@/middleware/validation';
import { authenticate, requireSuperAdmin } from '@/middleware/auth';

const router = Router();
// Order: validation → authentication → authorization → handler
const guard = [authenticate, requireSuperAdmin];

router.get('/', roleValidations.list, validate, ...guard, list);
router.get('/:id', roleValidations.getById, validate, ...guard, getById);
router.post('/', roleValidations.create, validate, ...guard, create);
router.put('/:id', roleValidations.update, validate, ...guard, update);
router.delete('/:id', roleValidations.remove, validate, ...guard, remove);
router.post('/:id/permissions', roleValidations.assignPermissions, validate, ...guard, assignPermissions);
router.delete('/:id/permissions', roleValidations.removePermissions, validate, ...guard, removePermissions);

export default router;
