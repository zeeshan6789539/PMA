import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, title, children }: DialogProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black/50 animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-md bg-background rounded-lg shadow-lg animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-1 rounded-md hover:bg-muted transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-4">{children}</div>
                </div>
            </div>
        </div>
    );
}
