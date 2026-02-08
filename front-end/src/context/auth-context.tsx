import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type User, type LoginRequest, type SignupRequest, type ChangePasswordRequest } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    signup: (data: SignupRequest) => Promise<void>;
    changePassword: (data: ChangePasswordRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (data: LoginRequest) => {
        const response = await authApi.login(data);
        const { user: userData, token: userToken } = response.data.data;

        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setToken(userToken);
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
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token,
                login,
                signup,
                changePassword,
                logout,
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
