import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// API response types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Auth types
export interface User {
    id: string;
    name: string;
    email: string;
    roleId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// Auth API calls
export const authApi = {
    login: (data: LoginRequest) =>
        api.post<ApiResponse<LoginResponse>>('/auth/login', data),

    signup: (data: SignupRequest) =>
        api.post<ApiResponse<User>>('/auth/signup', data),

    changePassword: (data: ChangePasswordRequest) =>
        api.post<ApiResponse<void>>('/auth/change-password', data),
};
