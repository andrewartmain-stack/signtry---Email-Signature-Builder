import React, { FC, ReactNode } from 'react'

interface CardProps {
    children: ReactNode;
    isActiveHover?: boolean;
    onClick: () => void;
    className?: string;
}

const Card: FC<CardProps> = ({
    children,
    isActiveHover = true,
    onClick,
    className = ""
}) => {
    return (
        <div
            className={`
                flex flex-col rounded-xl bg-white border border-gray-200 shadow-sm transition-all duration-200
                ${isActiveHover && 'hover:shadow-md hover:border-gray-300'}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export default Card