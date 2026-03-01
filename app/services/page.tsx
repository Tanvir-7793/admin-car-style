"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AdminCard from "@/components/AdminCard";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import {
    Search,
    Car,
    Sparkles,
    Package,
    Plus
} from "lucide-react";

interface Service {
    id: string;
    title: string;
    subtitle: string;
    type: string;
    description: string;
    features: string[];
    image: string;
    pricing: Array<{ name: string; price: string }>;
    slug: string;
    status: 'Active' | 'Draft';
    createdAt: string;
    updatedAt: string;
}
 

function ServicesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/services");
                if (!res.ok) {
                    throw new Error("Failed to load services");
                }
                const data: Service[] = await res.json();
                setServices(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load services from database.");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const filteredServices = services.filter((s) => {
        const term = searchTerm.toLowerCase();
        return (
            s.title?.toLowerCase().includes(term) ||
            s.type?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="min-h-screen bg-secondary/50 font-sans">
            <Sidebar />

            <main className="lg:pl-72 px-4 md:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <Header title="Services Management" />
                    <Link
                        href="/services/new"
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                    >
                        <Plus size={18} />
                        Add New Service
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white px-12 py-3 rounded-xl font-bold text-sm w-full focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all border border-brand-border"
                        />
                    </div>
                </div>

                {/* Service Cards Grid */}
                {loading && (
                    <div className="text-center py-10">
                        <p className="text-foreground/40 font-bold text-sm">Loading services...</p>
                    </div>
                )}
                
                {error && !loading && (
                    <div className="text-center py-10">
                        <p className="text-red-500 font-bold text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredServices.map((service) => (
                        <Link
                            key={service.id}
                            href={`/services/${service.id}`}
                            className="block"
                        >
                            <div className="bg-white rounded-xl border-2 border-brand-border p-6 transition-all hover:shadow-lg hover:border-primary cursor-pointer h-full">
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                        service.type === 'washing' 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'bg-amber-50 text-amber-600'
                                    }`}>
                                        {service.type === 'washing' ? <Car size={24} /> : <Sparkles size={24} />}
                                    </div>
                                    
                                    <h3 className="font-bold text-accent text-lg mb-2">{service.title}</h3>
                                    
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                                        service.status === 'Active'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-zinc-100 text-zinc-600'
                                    }`}>
                                        {service.status}
                                    </div>
                                    
                                    <div className={`text-xs font-medium uppercase tracking-wider ${
                                        service.type === 'washing' ? 'text-blue-600' : 'text-amber-600'
                                    }`}>
                                        {service.type}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredServices.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-foreground/20 mb-4 mx-auto">
                            <Package size={32} />
                        </div>
                        <p className="text-foreground/40 font-bold">No services found.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ProtectedServicesPage() {
    return (
        <AuthGuard>
            <ServicesPage />
        </AuthGuard>
    );
}
