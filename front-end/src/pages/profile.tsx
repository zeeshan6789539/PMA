import { Moon, Sun, LogOut, Key } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { successToastOptions } from '@/lib/toast-styles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { useState } from 'react';

export function ProfilePage() {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const { showSuccess } = useToast();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Header Card */}
                <Card className="overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
                    <CardContent className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                            <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg ring-4 ring-background">
                                <span className="text-3xl font-bold text-primary-foreground">
                                    {user?.name ? getInitials(user.name) : 'U'}
                                </span>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
                                <p className="text-muted-foreground">{user?.email}</p>
                            </div>
                            {/* Action Buttons with Icons */}
                            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                >
                                    <Key className="h-4 w-4 mr-2" />
                                    Change Password
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={toggleTheme}
                                >
                                    {theme === 'dark' ? (
                                        <>
                                            <Sun className="h-4 w-4 mr-2" />
                                            Light Mode
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="h-4 w-4 mr-2" />
                                            Dark Mode
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        logout();
                                        showSuccess('You have been signed out successfully', successToastOptions);
                                    }}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Change Password Modal */}
            <Dialog
                open={isPasswordModalOpen}
                onOpenChange={setIsPasswordModalOpen}
                title="Change Password"
            >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsPasswordModalOpen(false); }}>
                    <FormField
                        label="Current Password"
                        htmlFor="current-password"
                        inputProps={{
                            type: showCurrentPassword ? 'text' : 'password',
                            placeholder: 'Enter current password',
                        }}
                        showPasswordToggle
                        showPassword={showCurrentPassword}
                        onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                    <FormField
                        label="New Password"
                        htmlFor="new-password"
                        inputProps={{
                            type: showNewPassword ? 'text' : 'password',
                            placeholder: 'Enter new password',
                        }}
                        showPasswordToggle
                        showPassword={showNewPassword}
                        onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                    />
                    <FormField
                        label="Confirm Password"
                        htmlFor="confirm-password"
                        inputProps={{
                            type: showConfirmPassword ? 'text' : 'password',
                            placeholder: 'Confirm new password',
                        }}
                        showPasswordToggle
                        showPassword={showConfirmPassword}
                        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Change Password
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
