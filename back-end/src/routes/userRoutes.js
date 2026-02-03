const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, commonValidations } = require('../middleware/validation');
const userController = require('../controllers/userController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all users (ADMIN, SUPERADMIN)
router.get('/', 
  authorize(['ADMIN', 'SUPERADMIN']), 
  userController.getAllUsers
);

// Get user by ID (ADMIN, SUPERADMIN, or own profile)
router.get('/:id', 
  userController.getUserById
);

// Create new user (SUPERADMIN only)
router.post('/',
  authorize(['SUPERADMIN']),
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('password').isLength({ min: 6 }),
    body('roleId').optional().isString().trim()
  ],
  validate,
  userController.createUser
);

// Update user (ADMIN, SUPERADMIN, or own profile)
router.put('/:id',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('roleId').optional().isString().trim(),
    body('isActive').optional().isBoolean()
  ],
  validate,
  userController.updateUser
);

// Delete user (SUPERADMIN only)
router.delete('/:id',
  authorize(['SUPERADMIN']),
  userController.deleteUser
);

// Change user password (ADMIN, SUPERADMIN, or own password)
router.patch('/:id/password',
  [
    body('password').isLength({ min: 6 })
  ],
  validate,
  userController.changeUserPassword
);

// Get user permissions (ADMIN, SUPERADMIN, or own permissions)
router.get('/:id/permissions',
  userController.getUserPermissions
);

module.exports = router; 