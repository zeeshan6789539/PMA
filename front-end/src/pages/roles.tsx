import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { rolesApi, type Role, type CreateRoleRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Dialog } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showSuccess, showError } = useToast();
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<CreateRoleRequest>({ name: '' });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const { hasPermission } = useAuth();

    const canCreate = hasPermission('role', 'create');
    const canUpdate = hasPermission('role', 'update');
    const canDelete = hasPermission('role', 'delete');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const rolesRes = await rolesApi.list();
            setRoles(rolesRes.data.data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch data';
            showError(message, errorToastOptions);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (editingRole) {
                await rolesApi.update(editingRole.id, formData);
                showSuccess('Role updated successfully', successToastOptions);
            } else {
                await rolesApi.create(formData);
                showSuccess('Role created successfully', successToastOptions);
            }
            setEditModalOpen(false);
            setEditingRole(null);
            setFormData({ name: '' });
            fetchData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save role';
            showError(message, errorToastOptions);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({ name: role.name });
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
            setIsLoading(true);
            await rolesApi.delete(roleToDelete.id);
            showSuccess('Role deleted successfully', successToastOptions);
            fetchData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete role';
            showError(message, errorToastOptions);
        } finally {
            setIsLoading(false);
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
                    <Button variant="outline" onClick={fetchData} disabled={isLoading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    {canCreate && (
                        <Button onClick={() => { setEditingRole(null); setFormData({ name: '' }); setEditModalOpen(true); }}>
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
                                            {new Date(role.createdAt).toLocaleDateString()}
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
                onOpenChange={setEditModalOpen}
                title={editingRole ? 'Edit Role' : 'Create Role'}
            >
                <div className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {editingRole ? 'Update' : 'Create'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}
