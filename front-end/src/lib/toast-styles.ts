import type { ToastOptions } from 'react-hot-toast';

export const defaultToastOptions: ToastOptions = {
    duration: 4000,
    style: {
        background: '#363636',
        color: '#fff',
    },
};

export const successToastOptions: ToastOptions = {
    duration: 3000,
    style: {
        background: '#22c55e',
        color: '#fff',
    },
};

export const errorToastOptions: ToastOptions = {
    duration: 5000,
    style: {
        background: '#ef4444',
        color: '#fff',
    },
};
