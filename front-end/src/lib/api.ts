import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create a simple event bus for loading state (works outside React context)
type LoadingCallback = (loading: boolean) => void;
const loadingListeners: Set<LoadingCallback> = new Set();

export const setGlobalLoading = (loading: boolean) => {
    loadingListeners.forEach((callback) => callback(loading));
};

export const onLoadingChange = (callback: LoadingCallback) => {
    loadingListeners.add(callback);
    return () => {
        loadingListeners.delete(callback);
    };
};

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track active requests for smart loading state
let activeRequests = 0;

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Show loading for non-ignored requests
    const customConfig = config as InternalAxiosRequestConfig & { _hideLoading?: boolean };
    if (!customConfig._hideLoading) {
        activeRequests++;
        if (activeRequests === 1) {
            setGlobalLoading(true);
        }
    }

    return config;
});

// Handle auth errors and loading
api.interceptors.response.use(
    (response) => {
        // Hide loading
        const customConfig = response.config as InternalAxiosRequestConfig & { _hideLoading?: boolean };
        if (!customConfig._hideLoading) {
            activeRequests--;
            if (activeRequests === 0) {
                setGlobalLoading(false);
            }
        }

        return response;
    },
    (error) => {
        // Hide loading
        const customConfig = error.config as InternalAxiosRequestConfig & { _hideLoading?: boolean };
        if (customConfig && !customConfig._hideLoading) {
            activeRequests--;
            if (activeRequests === 0) {
                setGlobalLoading(false);
            }
        }

        // Extract error message from backend response
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';

        // Handle 400 Validation errors (don't clear auth data)
        if (error.response?.status === 400) {
            return Promise.reject(new Error(errorMessage));
        }

        // Handle 403 Super admin access required error
        if (error.response?.status === 403) {
            const errorData = error.response?.data;
            const isSuperAdminError = errorData?.message === 'Super admin access required' ||
                errorData?.status === 'fail';

            if (isSuperAdminError) {
                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('permissions');

                // Redirect to login
                window.location.href = '/login';
                return Promise.reject(new Error(errorMessage));
            }
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        // Always reject with the extracted error message
        return Promise.reject(new Error(errorMessage));
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
    role: Role;
    permissions: Permissions;
}

export interface Permissions {
    [resource: string]: {
        create?: boolean;
        read?: boolean;
        update?: boolean;
        delete?: boolean;
        manage?: boolean;
    };
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

// User types
export interface UserResponse {
    id: string;
    name: string;
    email: string;
    roleId: string | null;
    roleName?: string | null;
    role?: Role | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    roleId?: string;
    isActive?: boolean;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
    roleId?: string;
    isActive?: boolean;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
}

export interface PaginatedUsersResponse {
    users: UserResponse[];
    pagination: Pagination;
}

// User API calls
export const usersApi = {
    list: (page = 1, limit = 10, search?: string) =>
        api.get<ApiResponse<PaginatedUsersResponse>>('/users', {
            params: { page, limit, search },
        }),

    getById: (id: string) =>
        api.get<ApiResponse<UserResponse>>(`/users/${id}`),

    create: (data: CreateUserRequest) =>
        api.post<ApiResponse<UserResponse>>('/users', data),

    update: (id: string, data: UpdateUserRequest) =>
        api.put<ApiResponse<UserResponse>>(`/users/${id}`, data),

    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/users/${id}`),
};

// Role types
export interface Role {
    id: string;
    name: string;
    permissionCount?: number;
    userCount?: number;
    createdAt: string;
    updatedAt: string;
    permissions?: {
        [resource: string]: {
            create?: boolean;
            read?: boolean;
            update?: boolean;
            delete?: boolean;
        };
    };
}

export interface RolePermission {
    id: string;
    name: string;
}

export interface RoleResponse {
    id: string;
    name: string;
    permissions?: RolePermission[];
    permissionCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleRequest {
    name: string;
}

export interface UpdateRoleRequest {
    name: string;
}

export interface AssignPermissionsRequest {
    permissionIds: string[];
}

// Role API calls
export const rolesApi = {
    list: () =>
        api.get<ApiResponse<Role[]>>('/roles'),

    getById: (id: string) =>
        api.get<ApiResponse<RoleResponse>>(`/roles/${id}`),

    create: (data: CreateRoleRequest) =>
        api.post<ApiResponse<RoleResponse>>('/roles', data),

    update: (id: string, data: UpdateRoleRequest) =>
        api.put<ApiResponse<RoleResponse>>(`/roles/${id}`, data),

    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/roles/${id}`),

    assignPermissions: (id: string, data: AssignPermissionsRequest) =>
        api.post<ApiResponse<RoleResponse>>(`/roles/${id}/permissions`, data),

    removePermissions: (id: string, data: AssignPermissionsRequest) =>
        api.delete<ApiResponse<RoleResponse>>(`/roles/${id}/permissions`, { data }),
};

// Permission types
export interface PermissionResponse {
    id: string;
    name: string;
    action: string;
    resource: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePermissionRequest {
    name: string;
    resource: string;
    action: string;
    description?: string;
}

export interface UpdatePermissionRequest {
    name: string;
    resource: string;
    action: string;
    description?: string;
}

// Permission API calls
export const permissionsApi = {
    list: () =>
        api.get<ApiResponse<PermissionResponse[]>>('/permissions'),

    getById: (id: string) =>
        api.get<ApiResponse<PermissionResponse>>(`/permissions/${id}`),

    create: (data: CreatePermissionRequest) =>
        api.post<ApiResponse<PermissionResponse>>('/permissions', data),

    update: (id: string, data: UpdatePermissionRequest) =>
        api.put<ApiResponse<PermissionResponse>>(`/permissions/${id}`, data),

    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/permissions/${id}`),
};
