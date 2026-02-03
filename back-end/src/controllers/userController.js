const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseHandler = require('../utils/responseHandler');

const prisma = new PrismaClient();

// Get all users with pagination and filtering
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, roleId, isActive } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (roleId) {
    where.roleId = roleId;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: { select: { name: true } },
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json(ResponseHandler.success({
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    }
  }, 'Users retrieved successfully'));
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      roleId: true,
      role: { select: { name: true } },
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    return res.status(404).json(ResponseHandler.notFound('User not found'));
  }

  res.json(ResponseHandler.success(user, 'User retrieved successfully'));
});

// Create new user
const createUser = asyncHandler(async (req, res) => {
  const { email, name, password, roleId } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(400).json(ResponseHandler.validationError('User with this email already exists'));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Determine role id (use provided or default to role named 'USER')
  let resolvedRoleId = roleId;
  if (!resolvedRoleId) {
    const defaultRole = await prisma.role.findUnique({ where: { name: 'USER' }, select: { id: true } });
    if (!defaultRole) {
      return res.status(400).json(ResponseHandler.validationError('Default role USER not found'));
    }
    resolvedRoleId = defaultRole.id;
  } else {
    const roleExists = await prisma.role.findUnique({ where: { id: resolvedRoleId }, select: { id: true } });
    if (!roleExists) {
      return res.status(400).json(ResponseHandler.validationError('Invalid roleId'));
    }
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      roleId: resolvedRoleId
    },
    select: {
      id: true,
      email: true,
      name: true,
      roleId: true,
      role: { select: { name: true } },
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.status(201).json(ResponseHandler.success(user, 'User created successfully'));
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, name, roleId, isActive } = req.body;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    return res.status(404).json(ResponseHandler.notFound('User not found'));
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json(ResponseHandler.validationError('User with this email already exists'));
    }
  }

  // Validate roleId if provided
  if (roleId) {
    const roleExists = await prisma.role.findUnique({ where: { id: roleId }, select: { id: true } });
    if (!roleExists) {
      return res.status(400).json(ResponseHandler.validationError('Invalid roleId'));
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      email,
      name,
      roleId,
      isActive
    },
    select: {
      id: true,
      email: true,
      name: true,
      roleId: true,
      role: { select: { name: true } },
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.json(ResponseHandler.success(updatedUser, 'User updated successfully'));
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    return res.status(404).json(ResponseHandler.notFound('User not found'));
  }

  // Check if user is trying to delete themselves
  if (req.user.id === id) {
    return res.status(400).json(ResponseHandler.validationError('Cannot delete your own account'));
  }

  await prisma.user.delete({
    where: { id }
  });

  res.json(ResponseHandler.success(null, 'User deleted successfully'));
});

// Change user password
const changeUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    return res.status(404).json(ResponseHandler.notFound('User not found'));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });

  res.json(ResponseHandler.success(null, 'Password changed successfully'));
});

// Get user permissions (derived from role)
const getUserPermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, roleId: true } });

  if (!user) {
    return res.status(404).json(ResponseHandler.notFound('User not found'));
  }

  const permissions = await prisma.permission.findMany({
    where: {
      rolePermissions: { some: { roleId: user.roleId } }
    }
  });

  res.json(ResponseHandler.success({ permissions }, 'User permissions retrieved successfully'));
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getUserPermissions
}; 