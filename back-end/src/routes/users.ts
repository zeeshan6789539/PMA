import { Router } from 'express';
import {
  list,
  getById,
  create,
  update,
  remove,
} from '@/controllers/userController';
import { validate, userValidations } from '@/middleware/validation';

const router = Router();

router.get('/', userValidations.list, validate, list);
router.get('/:id', userValidations.getById, validate, getById);
router.post('/', userValidations.create, validate, create);
router.put('/:id', userValidations.update, validate, update);
router.delete('/:id', userValidations.remove, validate, remove);

export default router;
