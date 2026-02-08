import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rolesApi, permissionsApi, type RoleResponse, type PermissionResponse, type AssignPermissionsRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, Check, X } from 'lucide-react';

export function RoleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { showSuccess, showError } = useToast();
    const [role, setRole] = useState<RoleResponse | null>(null);
    const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [roleName, setRoleName] = useState('');

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
            setSelectedPermissions(roleRes.data.data.permissions?.map(p => p.id) || []);
            setRoleName(roleRes.data.data.name);
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

    const handleUpdateRoleName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !role) return;
        try {
            setIsSaving(true);
            await rolesApi.update(id, { name: roleName });
            showSuccess('Role name updated successfully', successToastOptions);
            setIsEditing(false);
            fetchData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update role name';
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

            <div className="grid gap-6 md:grid-cols-2">
                {/* Role Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Role Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <form onSubmit={handleUpdateRoleName} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roleName">Role Name</Label>
                                    <Input
                                        id="roleName"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Save
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <Label>Role Name</Label>
                                    <p className="text-lg font-medium">{role.name}</p>
                                </div>
                                <div>
                                    <Label>Created At</Label>
                                    <p className="text-muted-foreground">
                                        {new Date(role.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label>Permissions</Label>
                                    <p className="text-muted-foreground">
                                        {role.permissions?.length || 0} permissions assigned
                                    </p>
                                </div>
                                <Button onClick={() => setIsEditing(true)}>
                                    Edit Role Name
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Permissions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Permissions</span>
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
                            <div className="grid gap-2 max-h-96 overflow-y-auto">
                                {allPermissions.map((permission) => (
                                    <label
                                        key={permission.id}
                                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(permission.id)}
                                                onChange={() => togglePermission(permission.id)}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
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
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>
                                    {selectedPermissions.length} of {allPermissions.length} permissions selected
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
