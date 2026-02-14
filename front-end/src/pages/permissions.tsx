import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatDate } from '@/lib/helper';
import { type PermissionResponse } from '@/hooks/use-permissions';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Dialog } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, RefreshCw, Lock, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { usePermissions, useCreatePermission, useUpdatePermission, useDeletePermission } from '@/hooks/use-permissions';
import { createPermissionSchema, updatePermissionSchema, type CreatePermissionInput, type UpdatePermissionInput } from '@/lib/validation/schemas';
import type { CreatePermissionRequest } from '@/hooks/use-permissions';

interface PermissionGroup {
    resource: string;
    permissions: PermissionResponse[];
}

export function PermissionsPage() {
    const { showSuccess, showError } = useToast();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<PermissionResponse | null>(null);
    const [editingPermission, setEditingPermission] = useState<PermissionResponse | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const { hasPermission } = useAuth();

    const canCreate = hasPermission('permission', 'create');
    const canUpdate = hasPermission('permission', 'update');
    const canDelete = hasPermission('permission', 'delete');

    const { data: permissionsData, isLoading: permissionsLoading, refetch: refetchPermissions } = usePermissions();
    const createPermissionMutation = useCreatePermission();
    const updatePermissionMutation = useUpdatePermission();
    const deletePermissionMutation = useDeletePermission();

    const permissions = permissionsData || [];
    const isSaving = createPermissionMutation.isPending || updatePermissionMutation.isPending || deletePermissionMutation.isPending;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreatePermissionInput | UpdatePermissionInput>({
        resolver: zodResolver(editingPermission ? updatePermissionSchema : createPermissionSchema),
        defaultValues: {
            name: '',
            resource: '',
            action: '',
            description: '',
        },
    });

    const watchedResource = watch('resource', '');
    const watchedAction = watch('action', '');

    // Auto-generate name when resource or action changes
    useMemo(() => {
        if (watchedResource && watchedAction) {
            const generatedName = `${watchedResource}.${watchedAction}`;
            setValue('name', generatedName);
        }
    }, [watchedResource, watchedAction, setValue]);


    const onSubmit = async (data: CreatePermissionInput | UpdatePermissionInput) => {
        // Auto-generate name from resource and action
        const generatedName = `${data.resource}.${data.action}`;
        const finalData = { ...data, name: generatedName };

        try {
            if (editingPermission) {
                await updatePermissionMutation.mutateAsync({ id: editingPermission.id, data: finalData as UpdatePermissionInput });
                showSuccess('Permission updated successfully', successToastOptions);
            } else {
                await createPermissionMutation.mutateAsync(finalData as CreatePermissionRequest);
                showSuccess('Permission created successfully', successToastOptions);
            }
            setEditingPermission(null);
            reset();
            setShowFormModal(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save permission';
            showError(message, errorToastOptions);
        }
    };

    const handleEdit = (permission: PermissionResponse) => {
        setEditingPermission(permission);
        reset({
            name: permission.name,
            resource: permission.resource,
            action: permission.action,
            description: permission.description || '',
        });
        setShowFormModal(true);
    };

    const handleDelete = async (permission: PermissionResponse) => {
        setPermissionToDelete(permission);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!permissionToDelete) return;
        try {
            await deletePermissionMutation.mutateAsync(permissionToDelete.id);
            showSuccess('Permission deleted successfully', successToastOptions);
            setShowDeleteModal(false);
            setPermissionToDelete(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete permission';
            showError(message, errorToastOptions);
        }
    };

    const toggleGroup = (resource: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(resource) ? next.delete(resource) : next.add(resource);
            return next;
        });
    };

    const categorizedPermissions: PermissionGroup[] = useMemo(() => {
        const groups: Record<string, PermissionResponse[]> = {};
        permissions.forEach(p => {
            const res = p.resource || 'Other';
            if (!groups[res]) groups[res] = [];
            groups[res].push(p);
        });
        return Object.entries(groups).map(([resource, perms]) => ({
            resource,
            permissions: perms.sort((a, b) => a.name.localeCompare(b.name)),
        })).sort((a, b) => a.resource.localeCompare(b.resource));
    }, [permissions]);

    if (permissionsLoading && !permissions.length) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            {/* Header with Actions */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">Permissions</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetchPermissions()} disabled={isSaving}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    {canCreate && (
                        <Button onClick={() => {
                            setEditingPermission(null);
                            reset({
                                name: '',
                                resource: '',
                                action: '',
                                description: '',
                            });
                            setShowFormModal(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Permission
                        </Button>
                    )}
                </div>
            </div>

            {/* Permissions List */}
            <Card className="border-border shadow-sm">
                <CardHeader className="border-b bg-primary/10 py-4">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            <span className="text-foreground">All Permissions</span>
                        </div>
                        <span className="text-sm text-muted-foreground font-normal">
                            {permissions.length} permissions
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 bg-card">
                    <div className="divide-y divide-border">
                        {categorizedPermissions.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No permissions found. Create your first permission to get started.
                            </div>
                        ) : (
                            categorizedPermissions.map((group) => {
                                const isExpanded = expandedGroups.has(group.resource);

                                return (
                                    <div key={group.resource} className="p-4">
                                        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleGroup(group.resource)}>
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                                <h3 className="font-bold text-sm text-foreground capitalize">{group.resource} Management</h3>
                                                <span className="text-xs text-muted-foreground">({group.permissions.length} permissions)</span>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {group.permissions.map((permission) => (
                                                    <div key={permission.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/20">
                                                        <div className="flex flex-col overflow-hidden">
                                                            <code className="text-xs font-bold text-foreground truncate">{permission.name}</code>
                                                            <span className="text-[10px] text-muted-foreground truncate">{permission.description || '-'}</span>
                                                            <span className="text-[10px] text-muted-foreground truncate">
                                                                {formatDate(permission.createdAt)}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {canUpdate && (
                                                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(permission); }}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {canDelete && (
                                                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(permission); }}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Permission Modal */}
            <Dialog
                open={showFormModal}
                onOpenChange={(open) => {
                    setShowFormModal(open);
                    if (!open) {
                        setEditingPermission(null);
                        reset();
                    }
                }}
                title={editingPermission ? 'Edit Permission' : 'Create Permission'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Resource"
                            htmlFor="resource"
                            inputProps={{
                                ...register('resource'),
                                placeholder: "e.g., users",
                            }}
                            error={errors.resource?.message}
                        />
                        <FormField
                            label="Action"
                            htmlFor="action"
                            inputProps={{
                                ...register('action'),
                                placeholder: "e.g., create",
                            }}
                            error={errors.action?.message}
                        />
                    </div>
                    <FormField
                        label="Permission Name"
                        htmlFor="name"
                        inputProps={{
                            ...register('name'),
                            placeholder: "Auto-generated (e.g., users.create)",
                            readOnly: true,
                            className: "bg-muted",
                        }}
                        error={errors.name?.message}
                    />
                    <p className="text-xs text-muted-foreground">Permission name is automatically generated from resource and action</p>
                    <FormField
                        label="Description"
                        htmlFor="description"
                        inputProps={{
                            ...register('description'),
                            placeholder: "Brief description of this permission",
                        }}
                        error={errors.description?.message}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => { setShowFormModal(false); setEditingPermission(null); reset(); }}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingPermission ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Dialog>

            <ConfirmationModal
                open={showDeleteModal}
                onOpenChange={setShowDeleteModal}
                title="Delete Permission"
                description={`Are you sure you want to delete the permission "${permissionToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </div>
    );
}
