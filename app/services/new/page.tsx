"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AdminCard from "@/components/AdminCard";
import Input, { TextArea } from "@/components/Input";
import Button from "@/components/Button";
import { ArrowLeft, Save, Plus, X, ListChecks, DollarSign, Sparkles } from "lucide-react";
import { useState } from "react";

export default function NewServicePage() {
    const router = useRouter();

    const [pricingType, setPricingType] = useState<"single" | "tiered">("single");
    const [features, setFeatures] = useState<string[]>(["", "", ""]);

    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("");
    const [type, setType] = useState<"Washing" | "Premium">("Washing");
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFeatureChange = (index: number, value: string) => {
        setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
    };

    const handleSave = async (status: "Active" | "Draft") => {
        try {
            setSaving(true);
            setError(null);

            const mappedType: "Premium" | "Washing" =
                type === "Washing" ? "Washing" : "Premium";

            const cleanFeatures = features
                .map((f) => f.trim())
                .filter((f) => f.length > 0);

            const payload = {
                name: title,
                category: tag,
                price: basePrice,
                status,
                type: mappedType,
                description,
                features: cleanFeatures,
                image: imageUrl,
            };

            const res = await fetch("/api/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Failed to save service");
            }

            // On success go back to services list
            router.push("/services");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save service");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary/50 font-sans">
            <Sidebar />

            <main className="lg:pl-72 px-4 md:px-8 py-8 transition-all">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/services" className="w-10 h-10 bg-white rounded-xl border border-brand-border flex items-center justify-center text-foreground/40 hover:text-primary transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <Header title="Add Service" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <AdminCard title="General Details">
                            <div className="space-y-4">
                                <Input
                                    label="Title"
                                    placeholder="e.g. Premium Polish"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <Input
                                    label="Tag/Label"
                                    placeholder="e.g. Bestseller"
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                />

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest pl-1">Type</label>
                                    <select
                                        className="w-full bg-secondary border border-transparent px-4 py-3 rounded-xl font-bold text-accent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-hidden appearance-none cursor-pointer"
                                        value={type}
                                        onChange={(e) =>
                                            setType(e.target.value === "Washing" ? "Washing" : "Premium")
                                        }
                                    >
                                        <option value="Washing">Washing Service</option>
                                        <option value="Premium">Premium Detailing</option>
                                    </select>
                                </div>

                                <TextArea
                                    label="Description"
                                    placeholder="Explain what this service offers..."
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                />
                                <Input
                                    label="Service Image URL"
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>
                        </AdminCard>

                        <AdminCard
                            title="Pricing Model"
                            headerAction={
                                <div className="flex bg-secondary p-1 rounded-lg">
                                    <button
                                        onClick={() => setPricingType("single")}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${pricingType === 'single' ? 'bg-white text-primary shadow-sm' : 'text-foreground/40'
                                            }`}
                                    >Single</button>
                                    <button
                                        onClick={() => setPricingType("tiered")}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${pricingType === 'tiered' ? 'bg-white text-primary shadow-sm' : 'text-foreground/40'
                                            }`}
                                    >Tiered</button>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                {pricingType === 'single' ? (
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <Input
                                                label="Base Price (₹)"
                                                placeholder="0.00"
                                                type="number"
                                                value={basePrice || ""}
                                                onChange={(e) => setBasePrice(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                label="Estimated Time"
                                                placeholder="e.g. 45 mins"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Small Cars (₹)" placeholder="450" />
                                            <Input label="Medium Cars (₹)" placeholder="550" />
                                            <Input label="Large Cars (₹)" placeholder="650" />
                                            <Input label="Luxury/XL (₹)" placeholder="1200" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AdminCard>
                    </div>

                    <div className="space-y-6">
                        <AdminCard title="Service Features">
                            <div className="space-y-3">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <ListChecks className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={16} />
                                            <input
                                                placeholder="e.g. Interior Vacuuming"
                                                className="w-full bg-secondary pl-11 pr-4 py-3 rounded-xl font-bold text-sm text-accent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-hidden"
                                                value={feature}
                                                onChange={(e) => handleFeatureChange(i, e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setFeatures([...features, ""])}
                                    className="flex items-center gap-2 text-primary font-bold text-sm px-1 py-2 hover:opacity-80 transition-opacity"
                                >
                                    <Plus size={16} />
                                    Add bullet point
                                </button>
                            </div>
                        </AdminCard>

                        <div className="bg-accent rounded-2xl p-6 text-white overflow-hidden relative group">
                            <div className="relative z-10">
                                <h4 className="font-serif text-lg font-bold mb-1">Ready to Publish?</h4>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">Review all details before saving</p>

                                {error && (
                                    <p className="text-xs font-bold text-red-200 mb-3">
                                        {error}
                                    </p>
                                )}

                                <div className="flex flex-col gap-3">
                                    <Button
                                        className="w-full h-14 bg-white text-primary hover:bg-zinc-100 shadow-none"
                                        disabled={saving}
                                        onClick={() => handleSave("Active")}
                                    >
                                        <Save size={18} />
                                        {saving ? "Saving..." : "Save & Publish"}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-full h-14 bg-white/10 text-white border-transparent hover:bg-white/20"
                                        disabled={saving}
                                        onClick={() => handleSave("Draft")}
                                    >
                                        Save as Draft
                                    </Button>
                                </div>
                            </div>
                            <Sparkles className="absolute -right-4 -top-4 text-white/5 size-32 group-hover:rotate-12 transition-transform duration-700" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
