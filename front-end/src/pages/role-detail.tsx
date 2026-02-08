import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rolesApi, permissionsApi, type RoleResponse, type PermissionResponse, type RolePermission } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronDown, ChevronRight, Shield, Check, X } from 'lucide-react';

interface PermissionGroup {
    resource: string;
    permissions: PermissionResponse[];
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
            // Setting state based on your API structure
            setRole(roleRes.data.data);
            setAllPermissions(permissionsRes.data.data);
            setSelectedPermissions(roleRes.data.data.permissions?.map((p: RolePermission) => p.id) || []);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch details';
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
            const message = err instanceof Error ? err.message : 'Failed to update';
            showError(message, errorToastOptions);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(pid => pid !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleGroup = (resource: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(resource)) newSet.delete(resource);
            else newSet.add(resource);
            return newSet;
        });
    };

    const selectAllInGroup = (permissions: PermissionResponse[]) => {
        const pIds = permissions.map(p => p.id);
        const allSelected = pIds.every(id => selectedPermissions.includes(id));
        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(id => !pIds.includes(id)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...pIds])]);
        }
    };

    // Grouping using the 'resource' field from your API
    const categorizedPermissions: PermissionGroup[] = useMemo(() => {
        const groups: Record<string, PermissionResponse[]> = {};

        allPermissions.forEach(p => {
            const res = p.resource || 'Other';
            if (!groups[res]) groups[res] = [];
            groups[res].push(p);
        });

        return Object.entries(groups)
            .map(([resource, permissions]) => ({
                resource,
                permissions: permissions.sort((a, b) => a.action.localeCompare(b.action)),
            }))
            .sort((a, b) => a.resource.localeCompare(b.resource));
    }, [allPermissions]);

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <Breadcrumb
                items={[
                    { label: 'Roles', href: '/roles' },
                    { label: role?.name || 'Role Details' },
                ]}
                className="mb-6"
            />

            <Card>
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span>Role Permissions</span>
                        </div>
                        <Button onClick={handleSavePermissions} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="space-y-3">
                        {categorizedPermissions.map((group) => {
                            const isExpanded = expandedGroups.has(group.resource);
                            const selectedCount = group.permissions.filter(p => selectedPermissions.includes(p.id)).length;
                            const isFullySelected = selectedCount === group.permissions.length;

                            return (
                                <div key={group.resource} className="border rounded-md overflow-hidden border-slate-200 shadow-sm">
                                    {/* Group Header */}
                                    <div
                                        onClick={() => toggleGroup(group.resource)}
                                        className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            <span className="font-bold text-sm capitalize">
                                                {group.resource} Permissions
                                            </span>
                                            <span className="text-xs bg-white border px-2 py-0.5 rounded-full text-slate-600">
                                                {selectedCount} / {group.permissions.length} selected
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-[10px] uppercase font-bold"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                selectAllInGroup(group.permissions);
                                            }}
                                        >
                                            {isFullySelected ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>

                                    {/* Action List */}
                                    {isExpanded && (
                                        <div className="divide-y bg-white">
                                            {group.permissions.map((p) => {
                                                const isSelected = selectedPermissions.includes(p.id);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        className="flex items-center justify-between p-3 pl-10 hover:bg-slate-50/50 cursor-pointer"
                                                        onClick={() => togglePermission(p.id)}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium capitalize">
                                                                {p.action}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {p.description}
                                                            </span>
                                                        </div>
                                                        <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300'
                                                            }`}>
                                                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t text-sm text-slate-500">
                        Total Selected: <strong>{selectedPermissions.length}</strong> / {allPermissions.length}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}