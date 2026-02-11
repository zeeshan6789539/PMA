import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    requiredResource?: string;
    requiredAction?: string;
    fallbackPath?: string;
}

export function ProtectedRoute({ 
    requiredResource, 
    requiredAction, 
    fallbackPath = '/unauthorized' 
}: ProtectedRouteProps = {}) {
    const { isAuthenticated, isLoading, hasPermission } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check permissions if resource and action are specified
    if (requiredResource && requiredAction) {
        if (!hasPermission(requiredResource, requiredAction)) {
            return <Navigate to={fallbackPath} state={{ from: location }} replace />;
        }
    }

    return <Outlet />;
}
