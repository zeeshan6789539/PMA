import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { rolesApi, permissionsApi, type RoleResponse, type PermissionResponse, type RolePermission } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronDown, ChevronRight, Shield } from 'lucide-react';

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
            setRole(roleRes.data.data);
            setAllPermissions(permissionsRes.data.data);
            setSelectedPermissions(roleRes.data.data.permissions?.map((p: RolePermission) => p.id) || []);
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
            await rolesApi.assignPermissions(id, { permissionIds: selectedPermissions });
            showSuccess('Permissions updated successfully', successToastOptions);
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : 'Failed to update', errorToastOptions);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePermission = (permissionId: string) => {
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
        <div className="container mx-auto py-6 px-4">
            <Breadcrumb items={[{ label: 'Roles', href: '/roles' }, { label: role?.name || 'Role Details' }]} className="mb-6" />

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50 py-4">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-600" />
                            <span className="text-slate-800">Permissions</span>
                        </div>
                        <Button onClick={handleSavePermissions} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {categorizedPermissions.map((group) => {
                            const isExpanded = expandedGroups.has(group.resource);
                            const selectedCount = group.permissions.filter(p => selectedPermissions.includes(p.id)).length;
                            const isFullySelected = selectedCount === group.permissions.length;

                            return (
                                <div key={group.resource} className="p-4">
                                    <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleGroup(group.resource)}>
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                                            <h3 className="font-bold text-sm text-slate-700 capitalize">{group.resource} Management</h3>
                                            <span className="text-xs text-slate-400">({selectedCount} of {group.permissions.length} actions enabled)</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 hover:text-indigo-700 font-bold" onClick={(e) => { e.stopPropagation(); selectAllInGroup(group.permissions); }}>
                                            {isFullySelected ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>

                                    {isExpanded && (
                                        /* This Grid creates the 5-item row layout */
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                            {group.permissions.map((p) => {
                                                const isSelected = selectedPermissions.includes(p.id);
                                                return (
                                                    <div key={p.id} onClick={() => togglePermission(p.id)} className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${isSelected ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-xs font-bold text-slate-700 capitalize truncate">{p.action}</span>
                                                            <span className="text-[10px] text-slate-500 truncate">{p.description}</span>
                                                        </div>
                                                        <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${isSelected ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isSelected ? 'translate-x-5' : 'translate-x-1'}`} />
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
                </CardContent>
            </Card>
        </div>
    );
}