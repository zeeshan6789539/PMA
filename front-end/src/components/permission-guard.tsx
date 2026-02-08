import type { ReactNode } from 'react';
import { usePermissions } from '@/context/auth-context';

interface PermissionGuardProps {
    resource: string;
    action: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export function PermissionGuard({ resource, action, children, fallback = null }: PermissionGuardProps) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(resource, action)) {
        return fallback;
    }

    return <>{children}</>;
}

interface PermissionOrGuardProps {
    permissions: { resource: string; action: string }[];
    children: ReactNode;
    fallback?: ReactNode;
}

export function PermissionOrGuard({ permissions, children, fallback = null }: PermissionOrGuardProps) {
    const { hasPermission } = usePermissions();

    if (permissions.some(({ resource, action }) => hasPermission(resource, action))) {
        return <>{children}</>;
    }

    return fallback;
}

interface PermissionAndGuardProps {
    permissions: { resource: string; action: string }[];
    children: ReactNode;
    fallback?: ReactNode;
}

export function PermissionAndGuard({ permissions, children, fallback = null }: PermissionAndGuardProps) {
    const { hasPermission } = usePermissions();

    if (permissions.every(({ resource, action }) => hasPermission(resource, action))) {
        return <>{children}</>;
    }

    return fallback;
}
