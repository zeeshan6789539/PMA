import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, LogOut, Shield } from 'lucide-react';

export function HomePage() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {isAuthenticated ? `Welcome, ${user?.name || 'User'}!` : 'Welcome to PMA'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isAuthenticated
                            ? 'Your account is ready. Manage your settings below.'
                            : 'Please sign in to access your account.'}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {isAuthenticated ? (
                        <>
                            <Card>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>Profile</CardTitle>
                                        <CardDescription>Manage your account details</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Name</span>
                                            <span className="font-medium">{user?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Email</span>
                                            <span className="font-medium">{user?.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="font-medium text-green-500">
                                                {user?.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Settings className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>Settings</CardTitle>
                                        <CardDescription>Account management</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Link to="/change-password">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Shield className="mr-2 h-4 w-4" />
                                            Change Password
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-destructive hover:text-destructive"
                                        onClick={logout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card className="md:col-span-2">
                                <CardHeader className="text-center">
                                    <CardTitle>Get Started</CardTitle>
                                    <CardDescription>
                                        Sign in to access your account or create a new one
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link to="/login">
                                        <Button size="lg">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button variant="outline" size="lg">
                                            Create Account
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
