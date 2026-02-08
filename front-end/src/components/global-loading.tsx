import { useLoading } from '@/context/loading-context';

export function GlobalLoading() {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <span className="text-sm font-medium text-foreground">Loading...</span>
            </div>
        </div>
    );
}
