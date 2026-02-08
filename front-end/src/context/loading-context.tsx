import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onLoadingChange } from '@/lib/api';

interface LoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Subscribe to loading events from API interceptor
        const unsubscribe = onLoadingChange((loading) => {
            setIsLoading(loading);
        });

        return unsubscribe;
    }, []);

    const setLoading = (loading: boolean) => {
        setIsLoading(loading);
    };

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}
