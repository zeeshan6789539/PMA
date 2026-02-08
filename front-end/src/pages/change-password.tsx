import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ChangePasswordPage() {
    const navigate = useNavigate();
    const { changePassword, isAuthenticated, logout } = useAuth();
    const { showSuccess, showError } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const passwordRequirements = [
        { met: newPassword.length >= 8, text: 'At least 8 characters' },
        { met: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
        { met: /[a-z]/.test(newPassword), text: 'One lowercase letter' },
        { met: /[0-9]/.test(newPassword), text: 'One number' },
    ];

    const allRequirementsMet = passwordRequirements.every((req) => req.met);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!allRequirementsMet) {
            showError('New password does not meet requirements', errorToastOptions);
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Passwords do not match', errorToastOptions);
            return;
        }

        if (currentPassword === newPassword) {
            showError('New password must be different from current password', errorToastOptions);
            return;
        }

        setIsLoading(true);

        try {
            await changePassword({ currentPassword, newPassword });
            setSuccess(true);
            showSuccess('Password changed successfully! Please log in again.', successToastOptions);
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to change password. Please try again.';
            showError(errorMessage, errorToastOptions);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Password changed!</CardTitle>
                        <CardDescription>
                            Your password has been changed successfully. Please log in again.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                    <CardTitle className="text-2xl font-bold text-center">Change Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your current password and a new one
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                placeholder="Enter your current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            {newPassword && (
                                <div className="space-y-1 mt-2">
                                    {passwordRequirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-500' : 'text-muted-foreground'
                                                }`}
                                        >
                                            <CheckCircle2 className="h-3 w-3" />
                                            {req.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <div className="px-6 pb-6">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Changing password...
                                </>
                            ) : (
                                'Change Password'
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
