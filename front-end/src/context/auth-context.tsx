import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type User, type LoginRequest, type SignupRequest, type ChangePasswordRequest, type Permissions } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    permissions: Permissions | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    signup: (data: SignupRequest) => Promise<void>;
    changePassword: (data: ChangePasswordRequest) => Promise<void>;
    logout: () => void;
    hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedPermissions = localStorage.getItem('permissions');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                if (storedPermissions) {
                    const parsedPermissions = JSON.parse(storedPermissions);
                    // Migration: Fix for old bug where permissions was saved as undefined
                    // If parsedPermissions is null/undefined or has invalid structure, clear it
                    if (parsedPermissions && typeof parsedPermissions === 'object' && Object.keys(parsedPermissions).length > 0) {
                        setPermissions(parsedPermissions);
                    } else {
                        // Invalid permissions format - clear localStorage
                        localStorage.removeItem('permissions');
                    }
                }
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('permissions');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (data: LoginRequest) => {
        const response = await authApi.login(data);
        const { user: userData, token: userToken, role, permissions: _ } = response.data.data;

        // Extract permissions from role.permissions (backend returns permissions nested in role)
        const userPermissions = role?.permissions || null;

        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('permissions', JSON.stringify(userPermissions));

        setUser(userData);
        setToken(userToken);
        setPermissions(userPermissions);
    };

    const signup = async (data: SignupRequest) => {
        await authApi.signup(data);
    };

    const changePassword = async (data: ChangePasswordRequest) => {
        await authApi.changePassword(data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        setUser(null);
        setToken(null);
        setPermissions(null);
    };

    const hasPermission = (resource: string, action: string): boolean => {
        if (!permissions) return false;
        const resourcePermissions = permissions[resource];
        if (!resourcePermissions) return false;
        return resourcePermissions[action as keyof typeof resourcePermissions] === true;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                permissions,
                isLoading,
                isAuthenticated: !!token,
                login,
                signup,
                changePassword,
                logout,
                hasPermission,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function usePermissions() {
    const { permissions, hasPermission } = useAuth();
    return { permissions, hasPermission };
}
