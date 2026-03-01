"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("adminToken");
            
            if (!token) {
                router.push("/login");
                return;
            }

            // Simple token validation (in production, you'd verify with server)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const now = Date.now() / 1000;
                
                if (payload.exp < now) {
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminUser");
                    router.push("/login");
                    return;
                }

                setAuthenticated(true);
            } catch (error) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");
                router.push("/login");
                return;
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary/50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-foreground/60">Loading...</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
