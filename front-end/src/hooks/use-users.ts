import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { User } from '@/context/auth-context';

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

// User API calls
const usersApi = {
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

export const useUsers = (page = 1, limit = 10, search?: string) => {
    return useQuery({
        queryKey: ['users', page, limit, search],
        queryFn: () => usersApi.list(page, limit, search),
        select: (response) => response.data?.data,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => usersApi.getById(id),
        select: (response) => response.data?.data,
        enabled: !!id,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateUserRequest) => usersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => 
            usersApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', id] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => usersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
