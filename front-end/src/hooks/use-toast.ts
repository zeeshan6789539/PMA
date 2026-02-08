import toast, { type ToastOptions } from 'react-hot-toast';

export function useToast() {
    const showSuccess = (message: string, options?: ToastOptions) => {
        toast.success(message, options);
    };

    const showError = (message: string, options?: ToastOptions) => {
        toast.error(message, options);
    };

    const showLoading = (message: string) => {
        toast.loading(message);
    };

    const dismiss = (toastId?: string) => {
        if (toastId) {
            toast.dismiss(toastId);
        } else {
            toast.dismiss();
        }
    };

    return {
        toast,
        showSuccess,
        showError,
        showLoading,
        dismiss,
    };
}
