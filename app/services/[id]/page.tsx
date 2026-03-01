"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AdminCard from "@/components/AdminCard";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Save,
    X,
    Car,
    Sparkles,
    Package
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

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.id as string;

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editForm, setEditForm] = useState<Partial<Service>>({
        title: "",
        subtitle: "",
        type: "",
        description: "",
        features: [],
        image: "",
        pricing: [],
        status: "Active"
    });

    useEffect(() => {
        const fetchService = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/services");
                if (!res.ok) {
                    throw new Error("Failed to load services");
                }
                const services: Service[] = await res.json();
                const foundService = services.find(s => s.id === serviceId);
                
                if (!foundService) {
                    throw new Error("Service not found");
                }
                
                setService(foundService);
                setEditForm(foundService);
            } catch (err) {
                console.error(err);
                setError("Unable to load service.");
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    const startEdit = () => {
        if (service) {
            setEditForm(service);
            setEditing(true);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        if (service) {
            setEditForm(service);
        }
    };

    const saveEdit = async () => {
        if (!service) return;
        
        setSaving(true);
        try {
            const res = await fetch("/api/services", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: service.id, ...editForm }),
            });

            if (!res.ok) {
                throw new Error("Failed to update service");
            }

            const updatedService = { ...service, ...editForm };
            setService(updatedService);
            setEditing(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save service");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!service) return;
        
        const ok = window.confirm("Are you sure you want to delete this service?");
        if (!ok) return;

        try {
            const res = await fetch(`/api/services?id=${service.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to delete service");
            }

            router.push("/services");
        } catch (err) {
            console.error(err);
            alert("Failed to delete service");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary/50 font-sans">
                <Sidebar />
                <main className="lg:pl-72 px-4 md:px-8 py-8">
                    <div className="text-center py-10">
                        <p className="text-foreground/40 font-bold text-sm">Loading service...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-secondary/50 font-sans">
                <Sidebar />
                <main className="lg:pl-72 px-4 md:px-8 py-8">
                    <div className="text-center py-10">
                        <p className="text-red-500 font-bold text-sm">{error || "Service not found"}</p>
                        <button
                            onClick={() => router.push("/services")}
                            className="mt-4 text-primary hover:underline text-sm font-bold"
                        >
                            ← Back to Services
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/50 font-sans">
            <Sidebar />

            <main className="lg:pl-72 px-4 md:px-8 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.push("/services")}
                        className="p-2 text-foreground/60 hover:text-accent transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <Header title={editing ? "Edit Service" : service.title} />
                </div>

                <div className="max-w-4xl">
                    <AdminCard>
                        {editing ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-serif font-bold text-accent">Edit Service</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={cancelEdit}
                                            className="p-2 text-foreground/20 hover:text-red-500 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full bg-white px-4 py-3 rounded-xl font-bold text-sm border border-brand-border focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Subtitle</label>
                                        <input
                                            type="text"
                                            value={editForm.subtitle}
                                            onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                                            className="w-full bg-white px-4 py-3 rounded-xl font-bold text-sm border border-brand-border focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Type</label>
                                        <select
                                            value={editForm.type}
                                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                            className="w-full bg-white px-4 py-3 rounded-xl font-bold text-sm border border-brand-border focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="washing">Washing</option>
                                            <option value="detailing">Detailing</option>
                                            <option value="protection">Protection</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Status</label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'Active' | 'Draft' })}
                                            className="w-full bg-white px-4 py-3 rounded-xl font-bold text-sm border border-brand-border focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Draft">Draft</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full bg-white px-4 py-3 rounded-xl font-bold text-sm border border-brand-border focus:outline-hidden focus:ring-2 focus:ring-primary/20 min-h-[120px]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Image URL</label>
                                    <input
                                        type="text"
                                        value={editForm.image}
                                        onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                                        className="w-full bg-white px-4 py-3 rounded-xl font-bold text-sm border border-brand-border focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Pricing Options</label>
                                    <div className="space-y-3">
                                        {editForm.pricing?.map((price: any, index: number) => (
                                            <div key={index} className="flex gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Option name (e.g., Standard)"
                                                    value={price.name || ""}
                                                    onChange={(e) => {
                                                        const newPricing = [...(editForm.pricing || [])];
                                                        newPricing[index] = { ...newPricing[index], name: e.target.value };
                                                        setEditForm({ ...editForm, pricing: newPricing });
                                                    }}
                                                    className="flex-1 bg-white px-4 py-3 rounded-xl font-bold text-sm border border-brand-border focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Price (e.g., ₹2999)"
                                                    value={price.price || ""}
                                                    onChange={(e) => {
                                                        const newPricing = [...(editForm.pricing || [])];
                                                        newPricing[index] = { ...newPricing[index], price: e.target.value };
                                                        setEditForm({ ...editForm, pricing: newPricing });
                                                    }}
                                                    className="w-32 bg-white px-4 py-3 rounded-xl font-bold text-sm border border-brand-border focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newPricing = [...(editForm.pricing || [])];
                                                        newPricing.splice(index, 1);
                                                        setEditForm({ ...editForm, pricing: newPricing });
                                                    }}
                                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newPricing = [...(editForm.pricing || []), { name: "", price: "" }];
                                                setEditForm({ ...editForm, pricing: newPricing });
                                            }}
                                            className="w-full py-3 border-2 border-dashed border-brand-border text-foreground/40 rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all"
                                        >
                                            + Add Pricing Option
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={saveEdit}
                                        disabled={saving}
                                        className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-60"
                                    >
                                        <Save size={18} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="flex-1 border border-brand-border text-foreground/60 py-3 rounded-xl font-bold text-sm hover:bg-secondary transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-3xl font-serif font-bold text-accent mb-2">{service.title}</h3>
                                        <p className="text-foreground/60 text-lg">{service.subtitle}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={startEdit}
                                            className="p-3 text-foreground/20 hover:text-primary transition-colors"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="p-3 text-foreground/20 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                                        service.status === 'Active'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-zinc-100 text-zinc-600'
                                    }`}>
                                        {service.status}
                                    </div>
                                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                                        service.type === 'washing' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                        {service.type}
                                    </div>
                                </div>

                                {service.image && (
                                    <div>
                                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-3">Service Image</label>
                                        <div className="relative h-64 rounded-xl overflow-hidden bg-secondary">
                                            <img 
                                                src={service.image} 
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-3">Description</label>
                                    <div className="bg-secondary p-6 rounded-xl text-accent text-base leading-relaxed">
                                        {service.description}
                                    </div>
                                </div>

                                {service.features && service.features.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-3">Features</label>
                                        <div className="bg-secondary p-6 rounded-xl">
                                            <ul className="space-y-3">
                                                {service.features.map((feature, index) => (
                                                    <li key={index} className="text-accent text-base flex items-center gap-3">
                                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {service.pricing && service.pricing.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-3">Pricing Options</label>
                                        <div className="space-y-3">
                                            {service.pricing.map((price, index) => (
                                                <div key={index} className="bg-secondary p-4 rounded-xl flex justify-between items-center">
                                                    <span className="text-accent text-base font-medium">{price.name}</span>
                                                    <span className="text-primary font-bold text-lg">{price.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-brand-border">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                        <div>
                                            <span className="text-foreground/40 block mb-1">Service ID:</span>
                                            <span className="text-accent font-mono">{service.id}</span>
                                        </div>
                                        <div>
                                            <span className="text-foreground/40 block mb-1">Slug:</span>
                                            <span className="text-accent">{service.slug}</span>
                                        </div>
                                        <div>
                                            <span className="text-foreground/40 block mb-1">Last Updated:</span>
                                            <span className="text-accent">{new Date(service.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </AdminCard>
                </div>
            </main>
        </div>
    );
}
