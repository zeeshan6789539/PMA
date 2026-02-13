import { User, Users, Shield, Lock, Moon, Sun, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function Header() {
    const { isAuthenticated, user, hasPermission } = useAuth();
    const { theme, setTheme } = useTheme();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;
    const isRolesActive = () => location.pathname === '/roles' || location.pathname.startsWith('/roles/');

    const canViewUsers = hasPermission('user', 'read');
    const canViewRoles = hasPermission('role', 'read');
    const canViewPermissions = hasPermission('permission', 'read');

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="sticky top-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl animate-fade-in">
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
                        >
                            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                            PMA
                        </Link>

                        {isAuthenticated && (
                            <nav className="hidden md:flex items-center gap-2">
                                {canViewUsers && (
                                    <Link
                                        to="/users"
                                        className={`group px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${isActive('/users')
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
                                            }`}
                                    >
                                        <Users className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                                        <span>Users</span>
                                    </Link>
                                )}
                                {canViewRoles && (
                                    <Link
                                        to="/roles"
                                        className={`group px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${isRolesActive()
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
                                            }`}
                                    >
                                        <Shield className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                                        <span>Roles</span>
                                    </Link>
                                )}
                                {canViewPermissions && (
                                    <Link
                                        to="/permissions"
                                        className={`group px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${isActive('/permissions')
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
                                            }`}
                                    >
                                        <Lock className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                                        <span>Permissions</span>
                                    </Link>
                                )}
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full hover:bg-muted/50 hover:scale-110 transition-all duration-300"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 text-yellow-500 rotate-0 scale-100 transition-all duration-500" />
                            ) : (
                                <Moon className="h-5 w-5 text-primary rotate-0 scale-100 transition-all duration-500" />
                            )}
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        {isAuthenticated && (
                            <Link
                                to="/profile"
                                className={`group px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${isActive('/profile')
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
                                    }`}
                            >
                                <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                                <span className="hidden sm:inline">{user?.name || 'Profile'}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
