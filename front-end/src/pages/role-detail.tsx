import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rolesApi, permissionsApi, type RoleResponse, type PermissionResponse, type RolePermission, type AssignPermissionsRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X, ChevronDown, ChevronRight, Shield } from 'lucide-react';

interface PermissionAction {
    action: string;
    permissions: PermissionResponse[];
}

interface PermissionGroup {
    category: string;
    actions: PermissionAction[];
}

export function RoleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { showSuccess, showError } = useToast();
    const [role, setRole] = useState<RoleResponse | null>(null);
    const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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
            setSelectedPermissions(roleRes.data.data.permissions?.map((p: RolePermission) => p.id) || []);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch role details';
            showError(message, errorToastOptions);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSavePermissions = async () => {
        if (!id) return;
        try {
            setIsSaving(true);
            await rolesApi.assignPermissions(id, { permissionIds: selectedPermissions });
            showSuccess('Permissions updated successfully', successToastOptions);
            fetchData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update permissions';
            showError(message, errorToastOptions);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleGroup = (category: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const selectAllInGroup = (category: string, permissions: PermissionResponse[]) => {
        const allSelected = permissions.every(p => selectedPermissions.includes(p.id));
        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(pid => !permissions.find(p => p.id === pid)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...permissions.map(p => p.id)])]);
        }
    };

    const categorizedPermissions: PermissionGroup[] = useMemo(() => {
        const groups: Record<string, Record<string, PermissionResponse[]>> = {};

        allPermissions.forEach(permission => {
            // Extract category and action from permission name (e.g., "users.create" -> category: "users", action: "create")
            const parts = permission.name.split('.');
            const category = parts[0] || 'Other';
            const action = parts[1] || 'other';

            if (!groups[category]) {
                groups[category] = {};
            }
            if (!groups[category][action]) {
                groups[category][action] = [];
            }
            groups[category][action].push(permission);
        });

        return Object.entries(groups)
            .map(([category, actions]) => ({
                category: category.charAt(0).toUpperCase() + category.slice(1),
                actions: Object.entries(actions)
                    .map(([action, permissions]) => ({
                        action,
                        permissions: permissions.sort((a, b) => a.name.localeCompare(b.name)),
                    }))
                    .sort((a, b) => a.action.localeCompare(b.action)),
            }))
            .sort((a, b) => a.category.localeCompare(b.category));
    }, [allPermissions]);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!role) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Role not found</h2>
                    <Link to="/roles">
                        <Button>Back to Roles</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-2 px-4">
            <Breadcrumb
                items={[
                    { label: 'Roles', href: '/roles' },
                    { label: role.name || 'Role Details' },
                ]}
                className="mb-6"
            />

            {/* Permissions Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Permissions
                        </span>
                        <Button
                            size="sm"
                            onClick={handleSavePermissions}
                            disabled={isSaving}
                        >
                            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {categorizedPermissions.map((group) => {
                                const isExpanded = expandedGroups.has(group.category);
                                const groupPermissions = group.actions.flatMap(a => a.permissions);
                                const groupSelectedCount = groupPermissions.filter(p =>
                                    selectedPermissions.includes(p.id)
                                ).length;
                                const isGroupFullySelected = groupSelectedCount === groupPermissions.length;
                                const isGroupPartiallySelected = groupSelectedCount > 0 && !isGroupFullySelected;

                                return (
                                    <div key={group.category} className="border rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleGroup(group.category)}
                                            className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/75 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="font-medium">{group.category}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    ({groupSelectedCount}/{groupPermissions.length})
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    selectAllInGroup(group.category, groupPermissions);
                                                }}
                                                className="text-xs px-2 py-1 rounded border hover:bg-background transition-colors"
                                            >
                                                {isGroupFullySelected ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </button>

                                        {isExpanded && (
                                            <div className="divide-y">
                                                {group.actions.map((actionGroup) => (
                                                    <div key={actionGroup.action} className="pl-4">
                                                        <div className="flex items-center gap-2 py-2 pl-6">
                                                            <span className="text-xs font-medium uppercase text-muted-foreground">
                                                                {actionGroup.action}
                                                            </span>
                                                        </div>
                                                        {actionGroup.permissions.map((permission) => (
                                                            <label
                                                                key={permission.id}
                                                                className="flex items-center justify-between p-3 pl-14 cursor-pointer hover:bg-muted/30 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedPermissions.includes(permission.id)}
                                                                            onChange={() => togglePermission(permission.id)}
                                                                            className="sr-only"
                                                                        />
                                                                        <div
                                                                            onClick={() => togglePermission(permission.id)}
                                                                            className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${selectedPermissions.includes(permission.id)
                                                                                ? 'bg-primary'
                                                                                : 'bg-gray-200 dark:bg-gray-600'
                                                                                }`}
                                                                        >
                                                                            <div
                                                                                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform cursor-pointer mt-0.5 ${selectedPermissions.includes(permission.id)
                                                                                    ? 'translate-x-5 ml-0.5'
                                                                                    : 'translate-x-0.5'
                                                                                    }`}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-sm">{permission.name}</p>
                                                                        {permission.description && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {permission.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {selectedPermissions.includes(permission.id) ? (
                                                                    <Check className="h-4 w-4 text-green-500" />
                                                                ) : (
                                                                    <X className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </label>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                            <span>
                                {selectedPermissions.length} of {allPermissions.length} permissions selected
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
