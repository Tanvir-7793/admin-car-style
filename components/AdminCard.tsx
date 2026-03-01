import { ReactNode } from "react";

interface AdminCardProps {
    children: ReactNode;
    title?: string;
    className?: string;
    headerAction?: ReactNode;
}

export default function AdminCard({ children, title, className = "", headerAction }: AdminCardProps) {
    return (
        <div className={`bg-white rounded-2xl border border-brand-border shadow-sm hover:shadow-xl transition-all duration-300 p-4 md:p-6 ${className}`}>
            {(title || headerAction) && (
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    {title && <h3 className="text-lg md:text-xl font-serif font-bold text-accent">{title}</h3>}
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
