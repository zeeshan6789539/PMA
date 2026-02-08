import { Moon, Sun, User, LogOut } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
    const { theme, setTheme } = useTheme();
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold hover:text-primary transition-colors">
                    PMA
                </Link>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={toggleTheme}>
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {isAuthenticated && (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-sm">
                                <User className="h-4 w-4" />
                                <span className="text-muted-foreground">{user?.name}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
