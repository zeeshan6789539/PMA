import { useState, type ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { Location } from 'react-router';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions, errorToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation() as Location;
    const { login, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (isAuthenticated) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login({ email, password });
            showSuccess('Login successful!', successToastOptions);
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
            showError(errorMessage, errorToastOptions);
        } finally {
            setIsLoading(false);
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
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <FormField
                            label="Email"
                            htmlFor="email"
                            inputProps={{
                                type: "email",
                                placeholder: "john@example.com",
                                value: email,
                                onChange: (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
                                required: true,
                                disabled: isLoading,
                            }}
                        />
                        <FormField
                            label="Password"
                            htmlFor="password"
                            inputProps={{
                                type: "password",
                                placeholder: "Enter your password",
                                value: password,
                                onChange: (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
                                required: true,
                                disabled: isLoading,
                            }}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
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
