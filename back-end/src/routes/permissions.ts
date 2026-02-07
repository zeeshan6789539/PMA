import { Router } from 'express';
import {
  list,
  getById,
  create,
  update,
  remove,
} from '@/controllers/permissionController';
import { validate, permissionValidations } from '@/middleware/validation';

const router = Router();

router.get('/', permissionValidations.list, validate, list);
router.get('/:id', permissionValidations.getById, validate, getById);
router.post('/', permissionValidations.create, validate, create);
router.put('/:id', permissionValidations.update, validate, update);
router.delete('/:id', permissionValidations.remove, validate, remove);

export default router;
