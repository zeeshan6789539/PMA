import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';

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
const permissionsApi = {
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

export const usePermissions = () => {
    return useQuery({
        queryKey: ['permissions'],
        queryFn: () => permissionsApi.list(),
        select: (response) => response.data?.data,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
};

export const usePermission = (id: string) => {
    return useQuery({
        queryKey: ['permission', id],
        queryFn: () => permissionsApi.getById(id),
        select: (response) => response.data?.data,
        enabled: !!id,
    });
};

export const useCreatePermission = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreatePermissionRequest) => permissionsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        },
    });
};

export const useUpdatePermission = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePermissionRequest }) => 
            permissionsApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            queryClient.invalidateQueries({ queryKey: ['permission', id] });
        },
    });
};

export const useDeletePermission = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => permissionsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        },
    });
};
