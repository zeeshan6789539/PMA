import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
    LoginRequest,
    SignupRequest,
    ChangePasswordRequest,
    User,
    LoginResponse
} from '@/context/auth-context';

// Auth API calls
const authApi = {
    login: (data: LoginRequest) =>
        api.post<ApiResponse<LoginResponse>>('/auth/login', data),

    signup: (data: SignupRequest) =>
        api.post<ApiResponse<User>>('/auth/signup', data),

    changePassword: (data: ChangePasswordRequest) =>
        api.post<ApiResponse<void>>('/auth/change-password', data),
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: (response) => {
            const { user, token, role, permissions } = response.data?.data || {};
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('permissions', JSON.stringify(permissions));
            }
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        },
    });
};

export const useSignup = () => {
    return useMutation({
        mutationFn: (data: SignupRequest) => authApi.signup(data),
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    });
};
