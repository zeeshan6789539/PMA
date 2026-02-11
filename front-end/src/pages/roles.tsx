import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { formatDate } from '@/lib/helper';
import type { Role } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Dialog } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/use-roles';
import { createRoleSchema, updateRoleSchema, type CreateRoleInput, type UpdateRoleInput } from '@/lib/validation/schemas';

export function RolesPage() {
    const { showSuccess, showError } = useToast();
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const { hasPermission } = useAuth();

    const canCreate = hasPermission('role', 'create');
    const canUpdate = hasPermission('role', 'update');
    const canDelete = hasPermission('role', 'delete');

    const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles } = useRoles();
    const createRoleMutation = useCreateRole();
    const updateRoleMutation = useUpdateRole();
    const deleteRoleMutation = useDeleteRole();

    const roles = rolesData || [];
    const isLoading = rolesLoading || createRoleMutation.isPending || updateRoleMutation.isPending || deleteRoleMutation.isPending;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateRoleInput | UpdateRoleInput>({
        resolver: zodResolver(editingRole ? updateRoleSchema : createRoleSchema),
        defaultValues: {
            name: '',
        },
    });


    const onSubmit = async (data: CreateRoleInput | UpdateRoleInput) => {
        try {
            if (editingRole) {
                await updateRoleMutation.mutateAsync({ id: editingRole.id, data: data as UpdateRoleInput });
                showSuccess('Role updated successfully', successToastOptions);
            } else {
                await createRoleMutation.mutateAsync(data as CreateRoleInput);
                showSuccess('Role created successfully', successToastOptions);
            }
            setEditModalOpen(false);
            setEditingRole(null);
            reset();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save role';
            showError(message, errorToastOptions);
        }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        reset({ name: role.name });
        setEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const role = roles.find(r => r.id === id) || null;
        setRoleToDelete(role);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!roleToDelete) return;
        try {
            await deleteRoleMutation.mutateAsync(roleToDelete.id);
            showSuccess('Role deleted successfully', successToastOptions);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete role';
            showError(message, errorToastOptions);
        } finally {
            setDeleteModalOpen(false);
            setRoleToDelete(null);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Roles</h1>
                    <p className="text-muted-foreground">Manage user roles and permissions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetchRoles()} disabled={isLoading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    {canCreate && (
                        <Button onClick={() => { setEditingRole(null); reset(); setEditModalOpen(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Role
                        </Button>
                    )}
                </div>
            </div>

            {isLoading && !roles.length ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left p-4 font-medium">Name</th>
                                    <th className="text-left p-4 font-medium">Permissions</th>
                                    <th className="text-left p-4 font-medium">Users</th>
                                    <th className="text-left p-4 font-medium">Created At</th>
                                    <th className="text-right p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role) => (
                                    <tr key={role.id} className="border-b">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <Link to={`/roles/${role.id}`} className="hover:underline font-medium">
                                                    {role.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {role.permissionCount || 0} permissions
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {role.userCount || 0} users
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {formatDate(role.createdAt)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {canUpdate && (
                                                    <Button variant="outline" size="icon" onClick={() => handleEdit(role)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button variant="outline" size="icon" onClick={() => handleDelete(role.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {roles.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No roles found. Create your first role to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <ConfirmationModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                title="Delete Role"
                description={`Are you sure you want to delete the role "${roleToDelete?.name || ''}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                variant="destructive"
            />

            <Dialog
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) {
                        setEditingRole(null);
                        reset();
                    }
                }}
                title={editingRole ? 'Edit Role' : 'Create Role'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                    <FormField
                        label="Role Name"
                        htmlFor="name"
                        inputProps={{
                            ...register('name'),
                        }}
                        error={errors.name?.message}
                    />
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingRole ? 'Update' : 'Create'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => { setEditModalOpen(false); setEditingRole(null); reset(); }}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
