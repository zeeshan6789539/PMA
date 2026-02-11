import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { Role } from '@/context/auth-context';

// Role types
export interface RoleResponse {
    id: string;
    name: string;
    permissions?: RolePermission[];
    permissionCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface RolePermission {
    id: string;
    name: string;
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
const rolesApi = {
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

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: () => rolesApi.list(),
        select: (response) => response.data?.data,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useRole = (id: string) => {
    return useQuery({
        queryKey: ['role', id],
        queryFn: () => rolesApi.getById(id),
        select: (response) => response.data?.data,
        enabled: !!id,
    });
};

export const useCreateRole = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateRoleRequest) => rolesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });
};

export const useUpdateRole = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) => 
            rolesApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['role', id] });
        },
    });
};

export const useDeleteRole = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => rolesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });
};

export const useAssignPermissions = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AssignPermissionsRequest }) => 
            rolesApi.assignPermissions(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['role', id] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });
};

export const useRemovePermissions = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AssignPermissionsRequest }) => 
            rolesApi.removePermissions(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['role', id] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
    });
};
