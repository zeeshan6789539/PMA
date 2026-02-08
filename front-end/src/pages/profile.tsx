import { Link } from 'react-router-dom';
import { Moon, Sun, User, Settings, LogOut, Shield, Bell, Mail, Key } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProfilePage() {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Profile Header Card */}
                <Card className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
                    <CardContent className="px-8 pb-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
                            <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg ring-4 ring-background">
                                <span className="text-4xl font-bold text-primary-foreground">
                                    {user?.name ? getInitials(user.name) : 'U'}
                                </span>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
                                <p className="text-muted-foreground text-lg">{user?.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    {user?.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Two Column Layout for Main Content */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Account Information</CardTitle>
                                        <CardDescription>Your personal details</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                                        <div className="p-3 rounded-md bg-primary/10">
                                            <Mail className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="font-medium truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                                        <div className="p-3 rounded-md bg-primary/10">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-muted-foreground">Full Name</p>
                                            <p className="font-medium truncate">{user?.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Settings */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Settings className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Settings</CardTitle>
                                        <CardDescription>Manage your account preferences</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Link to="/change-password">
                                    <Button variant="outline" className="w-full justify-start h-auto py-4 px-4">
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="p-3 rounded-md bg-primary/10">
                                                <Key className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-base">Change Password</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Update your password for better security
                                                </p>
                                            </div>
                                        </div>
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-auto py-4 px-4 text-destructive hover:text-destructive hover:bg-destructive/5"
                                    onClick={logout}
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="p-3 rounded-md bg-destructive/10">
                                            <LogOut className="h-5 w-5 text-destructive" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-base">Sign Out</p>
                                            <p className="text-sm text-muted-foreground">
                                                Sign out of your account
                                            </p>
                                        </div>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Theme Settings */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        {theme === 'dark' ? (
                                            <Sun className="h-6 w-6 text-primary" />
                                        ) : (
                                            <Moon className="h-6 w-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Appearance</CardTitle>
                                        <CardDescription>Customize how the app looks</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-6 rounded-lg border bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 rounded-md bg-primary/10">
                                            {theme === 'dark' ? (
                                                <Sun className="h-6 w-6 text-primary" />
                                            ) : (
                                                <Moon className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-lg">
                                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {theme === 'dark'
                                                    ? 'Currently showing light colors'
                                                    : 'Currently showing dark colors'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" onClick={toggleTheme}>
                                        {theme === 'dark' ? (
                                            <>
                                                <Sun className="h-5 w-5 mr-2" />
                                                Switch to Light
                                            </>
                                        ) : (
                                            <>
                                                <Moon className="h-5 w-5 mr-2" />
                                                Switch to Dark
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats / Info Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Shield className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Security</CardTitle>
                                        <CardDescription>Account protection status</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                                                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Account Secured</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Your account is protected
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                            Active
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-primary/10">
                                                <Key className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Password</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Last changed recently
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            to="/change-password"
                                            className="text-primary hover:underline text-sm font-medium"
                                        >
                                            Update
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
