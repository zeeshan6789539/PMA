import { Response } from 'express';
import { IS_DEVELOPMENT } from './constant';

/**
 * Standard API Response Handler
 * Ensures all API responses follow the same format
 */

class ResponseHandler {
  /**
   * Success response
   * @param {Response} res - Express response object
   * @param {string} message - Success message
   * @param {*} data - Response data
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res: Response, message: string = 'Success', data: any = null, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Error response
   * @param {Response} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {*} error - Error details
   */
  static error(res: Response, message: string = 'Internal Server Error', statusCode: number = 500, error: any = null) {
    let finalMessage = message;
    
    // Consolidate error details into message for frontend consistency
    if (error) {
      if (typeof error === 'string') {
        finalMessage = `${message}: ${error}`;
      } else if (error.message) {
        finalMessage = `${message}: ${error.message}`;
      } else if (error.stack) {
        finalMessage = `${message}: ${error.stack}`;
      } else {
        finalMessage = `${message}: ${JSON.stringify(error)}`;
      }
    }
    
    return res.status(statusCode).json({
      success: false,
      message: finalMessage,
      error: IS_DEVELOPMENT ? error : null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Validation error response
   * @param {Response} res - Express response object
   * @param {string} message - Validation error message
   * @param {Array} errors - Validation errors array
   */
  static validationError(res: Response, message: string = 'Validation Error', errors: any[] = []) {
    let finalMessage = message;
    
    // Consolidate validation errors into message for frontend consistency
    if (errors.length > 0) {
      const errorMessages = errors.map(err => {
        if (typeof err === 'string') return err;
        if (err.message) return `${err.field || 'Field'}: ${err.message}`;
        return JSON.stringify(err);
      });
      finalMessage = `${message}: ${errorMessages.join(', ')}`;
    }
    
    return res.status(400).json({
      success: false,
      message: finalMessage,
      errors: IS_DEVELOPMENT ? errors : null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Not found response
   * @param {Response} res - Express response object
   * @param {string} message - Not found message
   */
  static notFound(res: Response, message: string = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Unauthorized response
   * @param {Response} res - Express response object
   * @param {string} message - Unauthorized message
   */
  static unauthorized(res: Response, message: string = 'Unauthorized') {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Forbidden response
   * @param {Response} res - Express response object
   * @param {string} message - Forbidden message
   */
  static forbidden(res: Response, message: string = 'Forbidden') {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

export default ResponseHandler;
