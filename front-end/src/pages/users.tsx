import { useState, useEffect } from 'react';
import { usersApi, type UserResponse, type CreateUserRequest, type UpdateUserRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Loader2, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

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
    });

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

    useEffect(() => {
        fetchUsers();
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
            setFormData({ name: '', email: '', password: '' });
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
                    <Button onClick={() => { setShowForm(true); setEditingUser(null); setFormData({ name: '', email: '', password: '' }); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{editingUser ? 'Edit User' : 'Create User'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                {!editingUser && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingUser}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingUser ? 'Update' : 'Create'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingUser(null); }}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
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
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleEdit(user)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
