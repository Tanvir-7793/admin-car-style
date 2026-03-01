import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    ...props
}: ButtonProps) {
    const variants = {
        primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all duration-300",
        secondary: "bg-secondary text-foreground hover:bg-gray-200 transition-all duration-300",
        danger: "border border-black/10 text-red-500 hover:bg-red-50 transition-all duration-300"
    };

    return (
        <button
            {...props}
            className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
