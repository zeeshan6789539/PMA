const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { UnauthorizedError, ForbiddenError } = require('./errorHandler');
const ResponseHandler = require('../utils/responseHandler');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: { select: { name: true } },
        createdAt: true
      }
    });

    if (!user) {
      return ResponseHandler.unauthorized(res, 'User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ResponseHandler.unauthorized(res, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return ResponseHandler.unauthorized(res, 'Token expired');
    }
    return ResponseHandler.unauthorized(res, 'Authentication failed');
  }
};

/**
 * Role-based Authorization Middleware
 * @param {string[]} roles - Array of allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }

    // Normalize roles argument: allow authorize('ADMIN','SUPERADMIN') or authorize(['ADMIN','SUPERADMIN'])
    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;
    const userRoleName = req.user.role?.name || req.user.role;
    if (!allowedRoles.includes(userRoleName)) {
      return ResponseHandler.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Similar to authenticate but doesn't fail if no token is provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: { select: { name: true } },
        createdAt: true
      }
    });

    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
}; 