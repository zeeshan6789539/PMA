const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseHandler = require('../utils/responseHandler');
const { ValidationError, UnauthorizedError } = require('../middleware/errorHandler');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * Register User
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, roleId } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ValidationError('User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Validate roleId exists
  const role = await prisma.role.findUnique({ where: { id: roleId }, select: { id: true } });
  if (!role) {
    throw new ValidationError('Invalid roleId');
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: role.id
    },
    select: {
      id: true,
      name: true,
      email: true,
      roleId: true,
      role: { select: { name: true } },
      createdAt: true
    }
  });

  // Generate token
  const token = generateToken(user.id);

  return ResponseHandler.success(res, 'User registered successfully', {
    user,
    token
  }, 201);
});

/**
 * Login User
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  // Get permissions based on user's role
  const permissions = await prisma.permission.findMany({
    where: {
      rolePermissions: {
        some: { roleId: user.roleId }
      }
    },
    select: {
      id: true,
      name: true,
      resource: true,
      action: true
    }
  });

  // Build permissions-by-resource map with explicit booleans
  // Initialize all actions for each resource to false based on the system-wide permissions
  const allPermissionPairs = await prisma.permission.findMany({
    select: { resource: true, action: true }
  });

  const permissionsByResource = {};
  for (const pair of allPermissionPairs) {
    if (!permissionsByResource[pair.resource]) {
      permissionsByResource[pair.resource] = {};
    }
    if (permissionsByResource[pair.resource][pair.action] === undefined) {
      permissionsByResource[pair.resource][pair.action] = false;
    }
  }

  // Set true for user's granted permissions
  for (const p of permissions) {
    if (!permissionsByResource[p.resource]) {
      permissionsByResource[p.resource] = {};
    }
    permissionsByResource[p.resource][p.action] = true;
  }

  return ResponseHandler.success(res, 'Login successful', {
    user: userWithoutPassword,
    token,
    assignPermission: permissionsByResource
  });
});

/**
 * Get Current User Profile
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      roleId: true,
      role: { select: { name: true } },
      createdAt: true,
      updatedAt: true
    }
  });

  return ResponseHandler.success(res, 'Profile retrieved successfully', { user });
});

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  // Check if email is already taken by another user
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: req.user.id }
      }
    });

    if (existingUser) {
      throw new ValidationError('Email is already taken');
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name: name || undefined,
      email: email || undefined
    },
    select: {
      id: true,
      name: true,
      email: true,
      roleId: true,
      role: { select: { name: true } },
      createdAt: true,
      updatedAt: true
    }
  });

  return ResponseHandler.success(res, 'Profile updated successfully', { user: updatedUser });
});

/**
 * Change Password
 * PUT /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword }
  });

  return ResponseHandler.success(res, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
}; 