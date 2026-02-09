import { useState, useEffect, type ChangeEvent } from 'react';
import { formatDate } from '@/utils/helper';
import { usersApi, rolesApi, type UserResponse, type CreateUserRequest, type UpdateUserRequest, type Role } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Dialog } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function UsersPage() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const { showSuccess, showError } = useToast();
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateUserRequest | UpdateUserRequest>({
        name: '',
        email: '',
        password: '',
        roleId: '',
        isActive: true,
    });
    const [roles, setRoles] = useState<Role[]>([]);
    const { hasPermission } = useAuth();

    const canCreate = hasPermission('user', 'create');
    const canUpdate = hasPermission('user', 'update');
    const canDelete = hasPermission('user', 'delete');

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await usersApi.list();
            setUsers(response.data?.data?.users || []);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch users';
            showError(message, errorToastOptions);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await rolesApi.list();
            setRoles(response.data?.data || []);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch roles';
            showError(message, errorToastOptions);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (editingUser) {
                await usersApi.update(editingUser.id, formData as UpdateUserRequest);
                showSuccess('User updated successfully', successToastOptions);
            } else {
                await usersApi.create(formData as CreateUserRequest);
                showSuccess('User created successfully', successToastOptions);
            }
            setShowForm(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', roleId: '', isActive: true });
            fetchUsers();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save user';
            showError(message, errorToastOptions);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (user: UserResponse) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            roleId: user.roleId || '',
            isActive: user.isActive,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        setDeletingUserId(id);
    };

    const confirmDelete = async () => {
        if (!deletingUserId) return;
        try {
            setIsLoading(true);
            await usersApi.delete(deletingUserId);
            showSuccess('User deleted successfully', successToastOptions);
            fetchUsers();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete user';
            showError(message, errorToastOptions);
        } finally {
            setIsLoading(false);
            setDeletingUserId(null);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-muted-foreground">Manage system users</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    {canCreate && (
                        <Button onClick={() => { setShowForm(true); setEditingUser(null); setFormData({ name: '', email: '', password: '', roleId: '', isActive: true }); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    )}
                </div>
            </div>

            {showForm && (
                <Dialog
                    open={showForm}
                    onOpenChange={(open) => {
                        setShowForm(open);
                        if (!open) {
                            setEditingUser(null);
                            setFormData({ name: '', email: '', password: '', roleId: '', isActive: true });
                        }
                    }}
                    title={editingUser ? 'Edit User' : 'Create User'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                label="Name"
                                htmlFor="name"
                                inputProps={{
                                    value: formData.name,
                                    onChange: (e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value }),
                                    required: true,
                                }}
                            />
                            <FormField
                                label="Email"
                                htmlFor="email"
                                inputProps={{
                                    type: "email",
                                    value: formData.email,
                                    onChange: (e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value }),
                                    required: true,
                                }}
                            />
                            {!editingUser && (
                                <FormField
                                    label="Password"
                                    htmlFor="password"
                                    inputProps={{
                                        type: "password",
                                        value: formData.password,
                                        onChange: (e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value }),
                                        required: !editingUser,
                                    }}
                                />
                            )}
                            <FormField
                                label="Role"
                                htmlFor="roleId"
                                fieldType="select"
                                inputProps={{
                                    value: formData.roleId || '',
                                    onChange: (e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, roleId: e.target.value }),
                                    options: roles as { id: string | number; name: string; }[],
                                    placeholder: "Select a role",
                                }}
                            />
                            <FormField
                                label="Status"
                                htmlFor="isActive"
                                fieldType="toggle"
                                inputProps={{
                                    isActive: formData.isActive ?? false,
                                    onClick: () => setFormData({ ...formData, isActive: !formData.isActive }),
                                }}
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {editingUser ? 'Update' : 'Create'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingUser(null); setFormData({ name: '', email: '', password: '', roleId: '', isActive: true }); }}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Dialog>
            )}

            {isLoading && !users.length ? (
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
                                    <th className="text-left p-4 font-medium">Email</th>
                                    <th className="text-left p-4 font-medium">Role</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-left p-4 font-medium">Created At</th>
                                    <th className="text-right p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(users || []).map((user) => (
                                    <tr key={user.id} className="border-b">
                                        <td className="p-4">{user.name}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">
                                            {user.roleName || 'No Role'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {canUpdate && (
                                                    <Button variant="outline" size="icon" onClick={() => handleEdit(user)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button variant="outline" size="icon" onClick={() => handleDelete(user.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No users found. Create your first user to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <ConfirmationModal
                open={deletingUserId !== null}
                onOpenChange={() => setDeletingUserId(null)}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                onConfirm={confirmDelete}
            />
        </div>
    );
}
