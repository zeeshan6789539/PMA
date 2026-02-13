import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validation/schemas';

export function ChangePasswordPage() {
    const navigate = useNavigate();
    const { changePassword, isAuthenticated, logout } = useAuth();
    const { showSuccess, showError } = useToast();
    const [success, setSuccess] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
    });

    const newPassword = watch('newPassword', '');

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

    const onSubmit = async (data: ChangePasswordInput) => {
        if (!allRequirementsMet) {
            showError('New password does not meet requirements', errorToastOptions);
            return;
        }

        try {
            await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
            setSuccess(true);
            showSuccess('Password changed successfully! Please log in again.', successToastOptions);
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to change password. Please try again.';
            showError(errorMessage, errorToastOptions);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="h-12 w-12 text-primary" />
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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            label="Current Password"
                            htmlFor="currentPassword"
                            inputProps={{
                                type: showCurrentPassword ? 'text' : 'password',
                                placeholder: "Enter your current password",
                                ...register('currentPassword'),
                                disabled: isSubmitting,
                            }}
                            showPasswordToggle
                            showPassword={showCurrentPassword}
                            onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
                            error={errors.currentPassword?.message}
                        />
                        <div className="space-y-2">
                            <FormField
                                label="New Password"
                                htmlFor="newPassword"
                                inputProps={{
                                    type: showNewPassword ? 'text' : 'password',
                                    placeholder: "Enter new password",
                                    ...register('newPassword'),
                                    disabled: isSubmitting,
                                }}
                                showPasswordToggle
                                showPassword={showNewPassword}
                                onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                                error={errors.newPassword?.message}
                            />
                            {newPassword && (
                                <div className="space-y-1 mt-2">
                                    {passwordRequirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-2 text-xs ${req.met ? 'text-primary' : 'text-muted-foreground'
                                                }`}
                                        >
                                            <CheckCircle2 className="h-3 w-3" />
                                            {req.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <FormField
                            label="Confirm New Password"
                            htmlFor="confirmPassword"
                            inputProps={{
                                type: showConfirmPassword ? 'text' : 'password',
                                placeholder: "Confirm new password",
                                ...register('confirmPassword'),
                                disabled: isSubmitting,
                            }}
                            showPasswordToggle
                            showPassword={showConfirmPassword}
                            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                            error={errors.confirmPassword?.message}
                        />
                    </CardContent>
                    <div className="px-6 pb-6">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
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
