import { useAuth } from '@/context/auth-context';
import { Users, Shield, Lock, TrendingUp } from 'lucide-react';

export function HomePage() {
    const { user, isAuthenticated } = useAuth();

    const stats = [
        { icon: Users, label: 'Total Users', value: '1,234', color: 'from-purple-500 to-blue-500' },
        { icon: Shield, label: 'Active Roles', value: '12', color: 'from-blue-500 to-cyan-500' },
        { icon: Lock, label: 'Permissions', value: '48', color: 'from-cyan-500 to-teal-500' },
        { icon: TrendingUp, label: 'Activity', value: '+23%', color: 'from-teal-500 to-green-500' },
    ];

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                        {isAuthenticated ? `Welcome back, ${user?.name || 'User'}!` : 'Welcome to PMA'}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {isAuthenticated
                            ? 'Manage your permissions, roles, and users with ease. Your comprehensive access control dashboard.'
                            : 'Please sign in to access your account and manage your permissions.'}
                    </p>
                </div>

                {/* Stats Grid */}
                {isAuthenticated && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className="glass-card p-6 rounded-2xl hover-lift animate-slide-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-3xl font-bold">{stat.value}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Feature Cards */}
                {isAuthenticated && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-8 rounded-2xl hover-lift">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold">User Management</h2>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                Efficiently manage user accounts, assign roles, and control access permissions across your organization.
                            </p>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Active</span>
                                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">Secure</span>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-2xl hover-lift">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold">Role-Based Access</h2>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                Create custom roles with specific permissions to ensure proper access control and security compliance.
                            </p>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">Flexible</span>
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Scalable</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
