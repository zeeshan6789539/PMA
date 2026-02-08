import { User, Users, Shield, Lock } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;


    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
                        PMA
                    </Link>

                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center gap-1">
                            <Link
                                to="/users"
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${isActive('/users')
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Users className="h-4 w-4" />
                                Users
                            </Link>
                            <Link
                                to="/roles"
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${isActive('/roles')
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Shield className="h-4 w-4" />
                                Roles
                            </Link>
                            <Link
                                to="/permissions"
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${isActive('/permissions')
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Lock className="h-4 w-4" />
                                Permissions
                            </Link>
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <Link
                            to="/profile"
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${isActive('/profile')
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <User className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
