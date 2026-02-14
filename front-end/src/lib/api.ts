import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';

// Environment validation
const API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
    throw new Error('VITE_API_URL environment variable is not set');
}

// Base API response types
export interface BaseResponse {
    success: boolean;
    message: string;
}

export interface ApiResponse<T> extends BaseResponse {
    data: T;
}

export interface ApiErrorResponse extends BaseResponse {
    error?: string;
    code?: string;
    status?: string;
}

// Enhanced error types
export interface ApiError extends Error {
    status?: number;
    code?: string;
    details?: any;
}

// Create API error class
class ApiErrorImpl extends Error implements ApiError {
    status?: number;
    code?: string;
    details?: any;

    constructor(
        message: string,
        status?: number,
        code?: string,
        details?: any
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

// Request configuration interface
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _hideLoading?: boolean;
    _retryCount?: number;
    metadata?: {
        startTime: Date;
    };
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
    withCredentials: false, // Set to true if using cookies
});

// Request interceptor for auth and logging
api.interceptors.request.use(
    (config: CustomAxiosRequestConfig) => {
        // Add auth token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };

        // Log request in development
        if (import.meta.env.DEV) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                data: config.data,
                params: config.params,
            });
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
    (response) => {
        // Calculate request duration
        const endTime = new Date();
        const startTime = (response.config as CustomAxiosRequestConfig).metadata?.startTime;
        const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

        // Log response in development
        if (import.meta.env.DEV) {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },
    async (error: AxiosError<ApiErrorResponse>) => {
        const config = error.config as CustomAxiosRequestConfig;
        
        // Calculate request duration
        const endTime = new Date();
        const startTime = config?.metadata?.startTime;
        const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

        // Log error in development
        if (import.meta.env.DEV) {
            console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url} (${duration}ms)`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
        }

        // Extract error information
        const status = error.response?.status;
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || 'An unexpected error occurred';
        const errorCode = errorData?.code;

        // Create typed error
        const apiError = new ApiErrorImpl(errorMessage, status, errorCode, errorData);

        // Handle 401 errors with token refresh logic
        if (status === 401 && !config?._retryCount) {
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken && !config?.url?.includes('/refresh-token')) {
                try {
                    // Set retry count to prevent infinite loops
                    config._retryCount = (config._retryCount || 0) + 1;
                    
                    // Attempt to refresh the token
                    const refreshResponse = await axios.post<ApiResponse<{ token: string }>>(
                        `${api.defaults.baseURL}/auth/refresh-token`,
                        { refreshToken },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    
                    const newToken = refreshResponse.data.data?.token;
                    if (newToken) {
                        // Update stored token
                        localStorage.setItem('token', newToken);
                        
                        // Update the authorization header for the original request
                        if (config.headers) {
                            config.headers.Authorization = `Bearer ${newToken}`;
                        }
                        
                        // Retry the original request
                        return api(config);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                }
            }
            
            // If refresh failed or no refresh token, clear auth data and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
            localStorage.removeItem('refreshToken');

            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        } else if (status === 403) {
            // Forbidden - check for super admin error
            const isSuperAdminError = errorData?.message === 'Super admin access required' ||
                errorData?.status === 'fail';

            if (isSuperAdminError) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('permissions');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }
        // 400 errors are handled by the caller (validation errors)
        // 500+ errors are server errors that should be logged
        else if (status && status >= 500) {
            console.error('Server Error:', apiError);
        }

        return Promise.reject(apiError);
    }
);

