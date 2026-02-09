import React from 'react';

interface ToggleButtonProps {
    isActive: boolean;
    onClick: () => void;
    label?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    activeClassName?: string;
    inactiveClassName?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
    isActive,
    onClick,
    label,
    disabled = false,
    size = 'md',
    className = '',
    activeClassName = '',
    inactiveClassName = '',
}) => {
    const sizeClasses = {
        sm: {
            track: 'h-5 w-9',
            thumb: 'h-3 w-3 translate-x-0.5',
            thumbActive: 'translate-x-5',
        },
        md: {
            track: 'h-6 w-11',
            thumb: 'h-4 w-4 translate-x-1',
            thumbActive: 'translate-x-6',
        },
        lg: {
            track: 'h-7 w-14',
            thumb: 'h-5 w-5 translate-x-1.5',
            thumbActive: 'translate-x-8',
        },
    };

    const { track, thumb, thumbActive } = sizeClasses[size];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {label && (
                <span className="text-sm font-medium text-foreground">
                    {label}
                </span>
            )}
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={`relative inline-flex ${track} items-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? `bg-primary border-primary ${activeClassName}` : `bg-muted dark:bg-muted-foreground/20 border-muted-foreground/30 ${inactiveClassName}`
                    }`}
            >
                <span
                    className={`inline-block ${thumb} transform rounded-full shadow-sm transition-transform bg-white ${isActive ? thumbActive : ''}`}
                />
            </button>
        </div>
    );
};

export default ToggleButton;
