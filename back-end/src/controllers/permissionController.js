const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseHandler = require('../utils/responseHandler');

const prisma = new PrismaClient();

// Get all permissions
const getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await prisma.permission.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return ResponseHandler.success(res, 'Permissions retrieved successfully', permissions);
});

// Create new permission
const createPermission = asyncHandler(async (req, res) => {
  const { name, description, resource, action } = req.body;

  const existingPermission = await prisma.permission.findUnique({
    where: { name }
  });

  if (existingPermission) {
    return ResponseHandler.validationError(res, 'Permission with this name already exists');
  }

  const permission = await prisma.permission.create({
    data: { name, description, resource, action }
  });

  return ResponseHandler.success(res, 'Permission created successfully', permission, 201);
});

// Grant permission to role by roleId
const grantPermissionToRole = asyncHandler(async (req, res) => {
  const { roleId, permissionId } = req.body;

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return ResponseHandler.validationError(res, 'Invalid roleId specified');
  }

  const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
  if (!permission) {
    return ResponseHandler.notFound(res, 'Permission not found');
  }

  const existing = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId, permissionId } }
  }).catch(async () => {
    // Fallback if compound unique name differs; perform manual check
    return prisma.rolePermission.findFirst({ where: { roleId, permissionId } });
  });

  if (existing) {
    return ResponseHandler.success(res, 'Permission already granted to role', existing);
  }

  const rolePermission = await prisma.rolePermission.create({
    data: { roleId, permissionId },
    include: { permission: true }
  });

  return ResponseHandler.success(res, 'Permission granted to role successfully', rolePermission, 201);
});

// Revoke permission from role by roleId
const revokePermissionFromRole = asyncHandler(async (req, res) => {
  const { roleId, permissionId } = req.params;

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return ResponseHandler.validationError(res, 'Invalid roleId specified');
  }

  await prisma.rolePermission.delete({
    where: {
      roleId_permissionId: { roleId, permissionId }
    }
  }).catch(async () => {
    // Fallback delete
    await prisma.rolePermission.deleteMany({ where: { roleId, permissionId } });
  });

  return ResponseHandler.success(res, 'Permission revoked from role successfully', null);
});

module.exports = {
  getAllPermissions,
  createPermission,
  grantPermissionToRole,
  revokePermissionFromRole
};