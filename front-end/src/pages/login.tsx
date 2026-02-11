import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { Location } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/validation/schemas';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation() as Location;
    const { isAuthenticated, login } = useAuth();
    const { showSuccess, showError } = useToast();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    if (isAuthenticated) {
        navigate('/');
        return null;
    }

    const onSubmit = async (data: LoginInput) => {
        try {
            await login(data);
            showSuccess('Login successful!', successToastOptions);
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
            showError(errorMessage, errorToastOptions);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            label="Email"
                            htmlFor="email"
                            inputProps={{
                                type: "email",
                                placeholder: "john@example.com",
                                ...register('email'),
                                disabled: isSubmitting,
                            }}
                            error={errors.email?.message}
                        />
                        <FormField
                            label="Password"
                            htmlFor="password"
                            inputProps={{
                                type: showPassword ? 'text' : 'password',
                                placeholder: "Enter your password",
                                ...register('password'),
                                disabled: isSubmitting,
                            }}
                            showPasswordToggle
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            error={errors.password?.message}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
