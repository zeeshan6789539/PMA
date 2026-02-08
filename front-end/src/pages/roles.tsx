import { useState, useEffect } from 'react';
import { rolesApi, permissionsApi, type RoleResponse, type CreateRoleRequest, type UpdateRoleRequest, type PermissionResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Loader2, Plus, Pencil, Trash2, RefreshCw, Shield } from 'lucide-react';

export function RolesPage() {
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [formData, setFormData] = useState<CreateRoleRequest>({
        name: '',
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<RoleResponse | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [rolesRes, permissionsRes] = await Promise.all([
                rolesApi.list(),
                permissionsApi.list(),
            ]);
            setRoles(rolesRes.data.data);
            setPermissions(permissionsRes.data.data);
            setError('');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(message);
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
            } else {
                await rolesApi.create(formData);
            }
            setShowForm(false);
            setEditingRole(null);
            setFormData({ name: '' });
            fetchData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save role';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (role: RoleResponse) => {
        setEditingRole(role);
        setSelectedPermissions(role.permissions?.map(p => p.id) || []);
        setFormData({ name: role.name });
        setShowForm(true);
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
            fetchData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete role';
            setError(message);
        } finally {
            setIsLoading(false);
            setDeleteModalOpen(false);
            setRoleToDelete(null);
        }
    };

    const handleAssignPermissions = async () => {
        if (!editingRole) return;
        try {
            setIsLoading(true);
            await rolesApi.assignPermissions(editingRole.id, { permissionIds: selectedPermissions });
            fetchData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to assign permissions';
            setError(message);
        } finally {
            setIsLoading(false);
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
                    <Button onClick={() => { setShowForm(true); setEditingRole(null); setFormData({ name: '' }); setSelectedPermissions([]); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Role
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                </div>
            )}

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{editingRole ? 'Edit Role' : 'Create Role'}</CardTitle>
                    </CardHeader>
                    <CardContent>
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

                            {editingRole && (
                                <div className="space-y-2">
                                    <Label>Permissions</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                                        {permissions.map((permission) => (
                                            <label key={permission.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedPermissions([...selectedPermissions, permission.id]);
                                                        } else {
                                                            setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                                                        }
                                                    }}
                                                />
                                                {permission.name}
                                            </label>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAssignPermissions} disabled={isLoading}>
                                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Save Permissions
                                    </Button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingRole ? 'Update' : 'Create'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingRole(null); }}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

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
                                                {role.name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {role.permissions?.length || 0} permissions
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {new Date(role.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleEdit(role)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => handleDelete(role.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
        </div>
    );
}
