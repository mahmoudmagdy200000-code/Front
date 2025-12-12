import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'sm' | 'md' | 'lg' | 'none';
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    padding = 'md',
    onClick
}) => {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div
            className={`
        bg-white rounded-xl shadow-md border border-gray-100
        ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${paddings[padding]}
        ${className}
      `}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyPress={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        >
            {children}
        </div>
    );
};
