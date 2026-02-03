const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const permissionController = require('../controllers/permissionController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all permissions (ADMIN, SUPERADMIN)
router.get('/', 
  authorize(['ADMIN', 'SUPERADMIN']), 
  permissionController.getAllPermissions
);

// Create new permission (SUPERADMIN only)
router.post('/',
  authorize(['SUPERADMIN']),
  [
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('description').optional().trim().isLength({ max: 200 }),
    body('resource').trim().isLength({ min: 2, max: 50 }),
    body('action').trim().isLength({ min: 2, max: 50 })
  ],
  validate,
  permissionController.createPermission
);

// Grant permission to role (SUPERADMIN only)
router.post('/grant-role',
  authorize(['SUPERADMIN']),
  [
    body('roleId').notEmpty(),
    body('permissionId').notEmpty()
  ],
  validate,
  permissionController.grantPermissionToRole
);

// Revoke permission from role (SUPERADMIN only) using roleId
router.delete('/role/:roleId/:permissionId',
  authorize(['SUPERADMIN']),
  permissionController.revokePermissionFromRole
);

module.exports = router; 