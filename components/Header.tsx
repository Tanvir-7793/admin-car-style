"use client";

import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Call logout API to clear cookies
            await fetch("/api/auth/logout", { method: "POST" });
            // Redirect to login page
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            // Still redirect even if API call fails
            router.push("/login");
        }
    };

    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-accent">{title}</h1>
                <p className="text-foreground/40 text-sm font-medium">Welcome back, Admin</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                    <User size={20} />
                </div>
                
                <button
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all shrink-0"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}
