import { useState, useEffect } from 'react';
import { permissionsApi, type PermissionResponse, type CreatePermissionRequest, type UpdatePermissionRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Loader2, Plus, Pencil, Trash2, RefreshCw, Lock } from 'lucide-react';

export function PermissionsPage() {
    const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<PermissionResponse | null>(null);
    const [editingPermission, setEditingPermission] = useState<PermissionResponse | null>(null);
    const [formData, setFormData] = useState<CreatePermissionRequest>({
        name: '',
        description: '',
    });

    const fetchPermissions = async () => {
        try {
            setIsLoading(true);
            const response = await permissionsApi.list();
            setPermissions(response.data.data);
            setError('');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch permissions';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (editingPermission) {
                await permissionsApi.update(editingPermission.id, formData);
            } else {
                await permissionsApi.create(formData);
            }
            setShowForm(false);
            setEditingPermission(null);
            setFormData({ name: '', description: '' });
            fetchPermissions();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save permission';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (permission: PermissionResponse) => {
        setEditingPermission(permission);
        setFormData({
            name: permission.name,
            description: permission.description || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (permission: PermissionResponse) => {
        setPermissionToDelete(permission);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!permissionToDelete) return;
        try {
            setIsLoading(true);
            await permissionsApi.delete(permissionToDelete.id);
            setShowDeleteModal(false);
            setPermissionToDelete(null);
            fetchPermissions();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete permission';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Permissions</h1>
                    <p className="text-muted-foreground">Manage system permissions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchPermissions} disabled={isLoading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => { setShowForm(true); setEditingPermission(null); setFormData({ name: '', description: '' }); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Permission
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
                        <CardTitle>{editingPermission ? 'Edit Permission' : 'Create Permission'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Permission Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., users.create"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of this permission"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingPermission ? 'Update' : 'Create'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingPermission(null); }}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {isLoading && !permissions.length ? (
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
                                    <th className="text-left p-4 font-medium">Description</th>
                                    <th className="text-left p-4 font-medium">Created At</th>
                                    <th className="text-right p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.map((permission) => (
                                    <tr key={permission.id} className="border-b">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                                <code className="text-sm bg-muted px-2 py-0.5 rounded">
                                                    {permission.name}
                                                </code>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {permission.description || '-'}
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {new Date(permission.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleEdit(permission)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => handleDelete(permission)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {permissions.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No permissions found. Create your first permission to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

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
