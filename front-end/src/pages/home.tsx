import { useAuth } from '@/context/auth-context';

export function HomePage() {
    const { user, isAuthenticated } = useAuth();

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
            </div>
        </div>
    );
}
