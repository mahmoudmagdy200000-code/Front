import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text,
    fullScreen = false,
    className = ''
}) => {
    const sizes = {
        sm: 'h-6 w-6 border-2',
        md: 'h-12 w-12 border-2',
        lg: 'h-16 w-16 border-3',
        xl: 'h-20 w-20 border-4'
    };

    const spinner = (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className={`animate-spin rounded-full border-t-transparent border-blue-600 ${sizes[size]}`} />
            {text && <p className="text-gray-600 font-medium animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};
