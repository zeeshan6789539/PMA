import { Router } from 'express';
import {
  list,
  getById,
  create,
  update,
  remove,
  assignPermissions,
  removePermissions,
} from '@/controllers/roleController';
import { validate, roleValidations } from '@/middleware/validation';

const router = Router();

router.get('/', roleValidations.list, validate, list);
router.get('/:id', roleValidations.getById, validate, getById);
router.post('/', roleValidations.create, validate, create);
router.put('/:id', roleValidations.update, validate, update);
router.delete('/:id', roleValidations.remove, validate, remove);
router.post('/:id/permissions', roleValidations.assignPermissions, validate, assignPermissions);
router.delete('/:id/permissions', roleValidations.removePermissions, validate, removePermissions);

export default router;
