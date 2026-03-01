import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export default function Input({ label, ...props }: InputProps) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest pl-1">
                {label}
            </label>
            <input
                {...props}
                className="w-full bg-secondary border border-transparent px-4 py-3 rounded-xl font-bold text-accent placeholder:text-foreground/30 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300"
            />
        </div>
    );
}

export function TextArea({ label, ...props }: any) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest pl-1">
                {label}
            </label>
            <textarea
                {...props}
                className="w-full bg-secondary border border-transparent px-4 py-3 rounded-xl font-bold text-accent placeholder:text-foreground/30 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300 min-h-32"
            />
        </div>
    );
}
