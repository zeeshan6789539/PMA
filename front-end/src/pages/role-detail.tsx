import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { rolesApi, permissionsApi, type RoleResponse, type PermissionResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleButton } from '@/components/ui/toggle-button';
import { Loader2, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface PermissionGroup {
    resource: string;
    permissions: PermissionResponse[];
}

export function RoleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { showSuccess, showError } = useToast();
    const [role, setRole] = useState<RoleResponse | null>(null);
    const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
    const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const { hasPermission } = useAuth();

    const canManage = hasPermission('permission', 'manage');


    const fetchData = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const [roleRes, permissionsRes] = await Promise.all([
                rolesApi.getById(id),
                permissionsApi.list(),
            ]);
            setRole(roleRes.data.data);
            setAllPermissions(permissionsRes.data.data);
            // Extract permission IDs from grouped format { user: { create: true, ... } }
            const groupedPermissions = roleRes.data.data.permissions || {};
            const permIds: string[] = [];
            Object.entries(groupedPermissions).forEach(([resource, actions]) => {
                Object.entries(actions as Record<string, boolean>).forEach(([action, enabled]) => {
                    if (enabled) {
                        // Find matching permission ID from allPermissions
                        const perm = permissionsRes.data.data.find(
                            (p: PermissionResponse) => p.resource === resource && p.action === action
                        );
                        if (perm) permIds.push(perm.id);
                    }
                });
            });
            setOriginalPermissions(permIds);
            setSelectedPermissions(permIds);
            // Expand all by default to show the grid
            setExpandedGroups(new Set(permissionsRes.data.data.map((p: any) => p.resource)));
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : 'Failed to fetch details', errorToastOptions);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleSavePermissions = async () => {
        if (!id) return;
        try {
            setIsSaving(true);
            // Calculate permissions to add and remove
            const permissionsToAdd = selectedPermissions.filter(id => !originalPermissions.includes(id));
            const permissionsToRemove = originalPermissions.filter(id => !selectedPermissions.includes(id));

            // Execute both operations in parallel if needed
            await Promise.all([
                permissionsToAdd.length > 0 && rolesApi.assignPermissions(id, { permissionIds: permissionsToAdd }),
                permissionsToRemove.length > 0 && rolesApi.removePermissions(id, { permissionIds: permissionsToRemove }),
            ]);

            showSuccess('Permissions updated successfully', successToastOptions);
            // Refresh the original permissions to match current state
            setOriginalPermissions([...selectedPermissions]);
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : 'Failed to update', errorToastOptions);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePermission = (permissionId: string) => {
        if (!canManage) return;
        setSelectedPermissions(prev => prev.includes(permissionId) ? prev.filter(id => id !== permissionId) : [...prev, permissionId]);
    };

    const toggleGroup = (resource: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(resource) ? next.delete(resource) : next.add(resource);
            return next;
        });
    };

    const selectAllInGroup = (permissions: PermissionResponse[]) => {
        if (!canManage) return;
        const pIds = permissions.map(p => p.id);
        const allIn = pIds.every(id => selectedPermissions.includes(id));
        setSelectedPermissions(prev => allIn ? prev.filter(id => !pIds.includes(id)) : [...new Set([...prev, ...pIds])]);
    };

    const categorizedPermissions: PermissionGroup[] = useMemo(() => {
        const groups: Record<string, PermissionResponse[]> = {};
        allPermissions.forEach(p => {
            const res = p.resource || 'Other';
            if (!groups[res]) groups[res] = [];
            groups[res].push(p);
        });
        return Object.entries(groups).map(([resource, permissions]) => ({
            resource,
            permissions: permissions.sort((a, b) => a.action.localeCompare(b.action)),
        })).sort((a, b) => a.resource.localeCompare(b.resource));
    }, [allPermissions]);

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-2 px-4">
            <Breadcrumb items={[{ label: 'Roles', href: '/roles' }, { label: role?.name || 'Role Details' }]} className="mb-2" />

            <Card className="border-border shadow-sm">
                <CardHeader className="border-b bg-secondary/50 py-4">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="text-foreground">Permissions</span>
                        </div>
                        {canManage && (
                            <Button onClick={handleSavePermissions} disabled={isSaving} className="bg-primary hover:bg-primary/90">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 bg-card">
                    <div className="divide-y divide-border">
                        {categorizedPermissions.map((group) => {
                            const isExpanded = expandedGroups.has(group.resource);
                            const selectedCount = group.permissions.filter(p => selectedPermissions.includes(p.id)).length;
                            const isFullySelected = selectedCount === group.permissions.length;

                            return (
                                <div key={group.resource} className="p-4">
                                    <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleGroup(group.resource)}>
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                            <h3 className="font-bold text-sm text-foreground capitalize">{group.resource} Management</h3>
                                            <span className="text-xs text-muted-foreground">({selectedCount} of {group.permissions.length} actions enabled)</span>
                                        </div>
                                        {canManage && (
                                            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary/80 font-bold" onClick={(e) => { e.stopPropagation(); selectAllInGroup(group.permissions); }}>
                                                {isFullySelected ? 'Deselect All' : 'Select All'}
                                            </Button>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        /* This Grid creates the 5-item row layout */
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                            {group.permissions.map((p) => {
                                                const isSelected = selectedPermissions.includes(p.id);
                                                return (
                                                    <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${canManage ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'} ${isSelected ? 'border-primary/30 bg-secondary/50' : 'border-border bg-card hover:border-primary/20'}`}>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-xs font-bold text-foreground capitalize truncate">{p.action}</span>
                                                            <span className="text-[10px] text-muted-foreground truncate">{p.description}</span>
                                                        </div>
                                                        <ToggleButton
                                                            isActive={isSelected}
                                                            onClick={() => togglePermission(p.id)}
                                                            size="sm"
                                                            disabled={!canManage}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}