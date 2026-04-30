"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    Car,
    Calendar,
    LogOut,
    Menu,
    X,
    MessageSquare,
    Images
} from "lucide-react";

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
    { icon: MessageSquare, label: "Inquiries", href: "/inquiries" },
    { icon: Car, label: "Services", href: "/services" },
    { icon: Calendar, label: "Bookings", href: "/bookings" },
    { icon: Images, label: "Gallery", href: "/gallery" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = () => {
        // Clear localStorage
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        
        // Redirect to login page
        window.location.href = "/login";
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-6 right-6 z-50 w-12 h-12 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:left-4 top-0 lg:top-4 bottom-0 lg:bottom-4 w-64 bg-white/95 lg:bg-white/80 backdrop-blur-md lg:rounded-2xl border-r lg:border border-brand-border shadow-2xl lg:shadow-sm flex flex-col z-50 transition-all duration-300 ${isOpen ? "left-0" : "-left-full lg:left-4"
                }`}>
                <div className="p-8">
                    <h1 className="text-2xl font-serif font-bold text-accent">CAR STYLE</h1>
                    <p className="text-[10px] tracking-[0.2em] font-bold text-primary/80 uppercase">Admin</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-foreground/60 hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto border-t border-brand-border/50">
                    <button 
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all duration-300"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                    <div className="mt-4 text-center text-[10px] text-foreground/40 font-bold uppercase tracking-wider">
                        Built with <span className="text-red-500 text-xs">♥</span> by{' '}
                        <a href="https://wa.me/919860193973" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Tanvir Mujawar
                        </a>
                    </div>
                </div>
            </aside>
        </>
    );
}
