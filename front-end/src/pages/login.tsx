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
import { Loader2, Shield, Sparkles } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <Card className="w-full max-w-md glass-card border-border/50 shadow-2xl animate-fade-in relative z-10">
                <CardHeader className="space-y-3 text-center pb-6">
                    <div className="flex justify-center mb-2">
                        <div className="p-4 rounded-2xl bg-gradient-primary shadow-lg shadow-primary/30">
                            <Shield className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-base">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-5">
                        <FormField
                            label="Email"
                            htmlFor="email"
                            inputProps={{
                                type: "email",
                                placeholder: "john@example.com",
                                ...register('email'),
                                disabled: isSubmitting,
                                className: "h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300"
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
                                className: "h-12 bg-background/50 border-border/50 focus:border-primary transition-all duration-300"
                            }}
                            showPasswordToggle
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            error={errors.password?.message}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-2">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Sign in
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Protected by enterprise-grade security
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
