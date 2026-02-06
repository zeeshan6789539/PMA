// constant.ts

/** * Environment configuration 
 */
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

/** * Mock/Default values for development 
 */
export const DEV_TEMP_PASSWORD = 'temp@123';

/**
 * Bcrypt configuration
 */
export const SALT_ROUNDS = 10;