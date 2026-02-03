const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const roleController = require('../controllers/roleController');

const router = express.Router();

// Apply authentication to all role routes
router.use(authenticate);

// SUPERADMIN only
const onlySuperadmin = authorize(['SUPERADMIN']);

// List roles
router.get('/',
  onlySuperadmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().trim()
  ],
  validate,
  roleController.getAllRoles
);

// Get role by id
router.get('/:id', onlySuperadmin, roleController.getRoleById);

// Create role
router.post('/'
  , onlySuperadmin
  , [ body('name').isLength({ min: 2, max: 50 }).trim() ]
  , validate
  , roleController.createRole
);

// Update role
router.put('/:id'
  , onlySuperadmin
  , [ body('name').isLength({ min: 2, max: 50 }).trim() ]
  , validate
  , roleController.updateRole
);

// Delete role
router.delete('/:id', onlySuperadmin, roleController.deleteRole);

// Get role permissions
router.get('/:id/permissions', onlySuperadmin, roleController.getRolePermissions);

module.exports = router;


