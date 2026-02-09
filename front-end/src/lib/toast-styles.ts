import type { ToastOptions } from 'react-hot-toast';

/**
 * Toast style configurations using centralized color tokens
 * Colors are defined in index.css as CSS custom properties
 */
export const defaultToastOptions: ToastOptions = {
    duration: 4000,
    style: {
        background: 'var(--color-dark-background)',
        color: 'var(--color-dark-foreground)',
    },
};

export const successToastOptions: ToastOptions = {
    duration: 3000,
    style: {
        background: 'var(--color-primary)',
        color: 'var(--color-primary-foreground)',
    },
};

export const errorToastOptions: ToastOptions = {
    duration: 5000,
    style: {
        background: 'var(--color-destructive)',
        color: 'var(--color-destructive-foreground)',
    },
};
