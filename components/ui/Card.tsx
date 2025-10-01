import React, { ReactNode } from 'react';

const Card: React.FC<{ children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...rest }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-purple-100 ${className}`} {...rest}>
        {children}
    </div>
);

export default Card;