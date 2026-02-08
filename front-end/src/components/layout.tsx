import { Outlet } from 'react-router';
import type { ReactNode } from 'react';
import { Header } from '@/components/header';

interface LayoutProps {
    children?: ReactNode;
    showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {showHeader && <Header />}
            <main>
                {children ?? <Outlet />}
            </main>
        </div>
    );
}

export function AuthLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
