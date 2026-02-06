// constant.ts

/** 
 * Environment configuration 
 */
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const PORT = process.env.PORT || 3000;

/** 
 * Database configuration 
 */
export const DATABASE_URL = process.env.DATABASE_URL!;

/** 
 * Security configuration 
 */
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

/** 
 * Mock/Default values for development 
 */
export const DEV_TEMP_PASSWORD = 'temp@123';

/**
 * Bcrypt configuration
 */
export const SALT_ROUNDS = 10;