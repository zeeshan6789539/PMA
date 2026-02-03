const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseHandler = require('../utils/responseHandler');

const prisma = new PrismaClient();

const BASE_ROLE_NAMES = new Set(['SUPERADMIN', 'ADMIN', 'USER']);

// GET /api/roles
const getAllRoles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      select: { id: true, name: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.role.count({ where })
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));
  return ResponseHandler.success(res, 'Roles retrieved successfully', {
    roles,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages }
  });
});

// GET /api/roles/:id
const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await prisma.role.findUnique({
    where: { id },
    select: { id: true, name: true, createdAt: true, updatedAt: true }
  });
  if (!role) return ResponseHandler.notFound(res, 'Role not found');
  return ResponseHandler.success(res, 'Role retrieved successfully', role);
});

// POST /api/roles
const createRole = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    return ResponseHandler.validationError(res, 'Role name is required');
  }

  const existing = await prisma.role.findUnique({ where: { name: trimmedName } });
  if (existing) {
    return ResponseHandler.validationError(res, 'Role name already exists');
  }

  const role = await prisma.role.create({ data: { name: trimmedName }, select: { id: true, name: true, createdAt: true, updatedAt: true } });
  return ResponseHandler.success(res, 'Role created successfully', role, 201);
});

// PUT /api/roles/:id
const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return ResponseHandler.notFound(res, 'Role not found');

  if (BASE_ROLE_NAMES.has(role.name)) {
    return ResponseHandler.validationError(res, 'System role cannot be modified');
  }

  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    return ResponseHandler.validationError(res, 'Role name is required');
  }

  const conflict = await prisma.role.findFirst({ where: { name: trimmedName, id: { not: id } } });
  if (conflict) {
    return ResponseHandler.validationError(res, 'Role name already exists');
  }

  const updated = await prisma.role.update({
    where: { id },
    data: { name: trimmedName },
    select: { id: true, name: true, createdAt: true, updatedAt: true }
  });
  return ResponseHandler.success(res, 'Role updated successfully', updated);
});

// DELETE /api/roles/:id
const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return ResponseHandler.notFound(res, 'Role not found');

  if (BASE_ROLE_NAMES.has(role.name)) {
    return ResponseHandler.validationError(res, 'System role cannot be deleted');
  }

  const usersWithRole = await prisma.user.count({ where: { roleId: id } });
  if (usersWithRole > 0) {
    return ResponseHandler.validationError(res, 'Cannot delete role while users are assigned');
  }

  await prisma.role.delete({ where: { id } });
  return ResponseHandler.success(res, 'Role deleted successfully', null);
});

// GET /api/roles/:id/permissions
const getRolePermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await prisma.role.findUnique({ where: { id }, select: { id: true } });
  if (!role) return ResponseHandler.notFound(res, 'Role not found');

  const permissions = await prisma.permission.findMany({
    where: { rolePermissions: { some: { roleId: id } } },
    select: { id: true, name: true, resource: true, action: true }
  });

  return ResponseHandler.success(res, 'Role permissions retrieved successfully', { roleId: id, permissions });
});

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions
};


