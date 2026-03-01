"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AdminCard from "@/components/AdminCard";
import AuthGuard from "@/components/AuthGuard";
import {
    Search,
    CheckCircle2,
    Phone,
    Mail,
    Clock,
    ExternalLink,
    ChevronRight,
    MoreVertical
} from "lucide-react";

interface Inquiry {
    id: string;
    name: string;
    phone: string;
    subject: string;
    message: string;
    date: string;
    status: 'New' | 'Read' | 'Replied';
    isCallback: boolean;
}

function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getWhatsAppLink = (phone: string) => {
        if (!phone) return "https://wa.me";
        const digits = phone.replace(/\D/g, "");
        // If 10-digit Indian number, prefix 91
        const withCountry = digits.length === 10 ? `91${digits}` : digits;
        return `https://wa.me/${withCountry}`;
    };

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/inquiries");
                if (!res.ok) {
                    throw new Error("Failed to load inquiries");
                }
                const data: Inquiry[] = await res.json();
                setInquiries(data);
                setFilteredInquiries(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load inquiries from database.");
            } finally {
                setLoading(false);
            }
        };

        fetchInquiries();
    }, []);

    // Filter inquiries based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredInquiries(inquiries);
        } else {
            const filtered = inquiries.filter(inq => 
                inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inq.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inq.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inq.phone.includes(searchTerm)
            );
            setFilteredInquiries(filtered);
        }
    }, [searchTerm, inquiries]);

    const toggleStatus = async (id: string, current: 'New' | 'Read' | 'Replied') => {
        const next: Record<string, 'New' | 'Read' | 'Replied'> = {
            'New': 'Read',
            'Read': 'Replied',
            'Replied': 'Read'
        };
        const newStatus = next[current];
        
        try {
            // Update status in database
            const res = await fetch("/api/inquiries", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            // Update local state only after successful database update
            setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
            setFilteredInquiries(filteredInquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
            
            // Also update selectedInquiry if it's the one being changed
            if (selectedInquiry && selectedInquiry.id === id) {
                setSelectedInquiry({ ...selectedInquiry, status: newStatus });
            }
        } catch (err) {
            console.error("Failed to update inquiry status:", err);
            // Optionally show an error message to the user
        }
    };

    return (
        <div className="min-h-screen bg-secondary/50 font-sans">
            <Sidebar />

            <main className="lg:pl-72 px-4 md:px-8 py-8 transition-all duration-300">
                <Header title="Contact Inquiries" />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Inquiry List */}
                    <div className="xl:col-span-2 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search inquiries..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white px-12 py-3 rounded-xl font-bold text-sm w-full focus:ring-2 focus:ring-primary/20 transition-all border border-brand-border"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredInquiries.map((inq) => (
                                <div
                                    key={inq.id}
                                    onClick={() => setSelectedInquiry(inq)}
                                    className={`bg-white rounded-2xl border transition-all duration-300 cursor-pointer p-5 hover:shadow-lg ${selectedInquiry?.id === inq.id ? 'border-primary shadow-md ring-1 ring-primary/10' : 'border-brand-border'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inq.status === 'New' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground/40'
                                                }`}>
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-accent leading-tight">{inq.name}</h4>
                                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{inq.date}</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${inq.status === 'New' ? 'bg-blue-50 text-blue-600' :
                                                inq.status === 'Read' ? 'bg-zinc-100 text-zinc-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                            {inq.status}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-foreground/60 mb-1">{inq.subject}</p>
                                            <p className="text-xs text-foreground/40 line-clamp-1">{inq.message}</p>
                                        </div>
                                        {inq.isCallback && (
                                            <div className="shrink-0 ml-4 flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase">
                                                <Phone size={10} />
                                                Callback
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details Side Panel */}
                    <div className="xl:col-start-3">
                        {selectedInquiry ? (
                            <AdminCard className="sticky top-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-serif font-bold text-accent">{selectedInquiry.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <a href={`tel:${selectedInquiry.phone}`} className="text-primary font-bold text-sm flex items-center gap-1.5 hover:underline">
                                                <Phone size={14} />
                                                {selectedInquiry.phone}
                                            </a>
                                        </div>
                                    </div>
                                    <button className="p-2 text-foreground/20 hover:text-accent transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Subject</label>
                                        <div className="bg-secondary p-4 rounded-xl font-bold text-accent text-sm">
                                            {selectedInquiry.subject}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-1">Message</label>
                                        <div className="bg-secondary p-4 rounded-xl text-accent text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedInquiry.message}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-brand-border space-y-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleStatus(selectedInquiry.id, selectedInquiry.status)}
                                                className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                                                    selectedInquiry.status === 'New' 
                                                        ? 'bg-primary text-white hover:bg-blue-600 shadow-primary/20' 
                                                        : selectedInquiry.status === 'Read'
                                                        ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20'
                                                        : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
                                                }`}
                                            >
                                                <CheckCircle2 size={16} />
                                                {selectedInquiry.status === 'Replied' ? 'Re-open' : selectedInquiry.status === 'Read' ? 'Replied' : 'Mark as Read'}
                                            </button>
                                            <a
                                                href={`tel:${selectedInquiry.phone}`}
                                                className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
                                            >
                                                <Phone size={16} />
                                                Call Now
                                            </a>
                                        </div>
                                        <div className="flex gap-2">
                                            <a
                                                href={getWhatsAppLink(selectedInquiry.phone)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-secondary text-accent py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
                                            >
                                                <Phone size={16} />
                                                Reply on WhatsApp
                                            </a>
                                        </div>
                                    </div>

                                    {selectedInquiry.isCallback && (
                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
                                                <Clock size={14} />
                                                Callback Requested
                                            </div>
                                            <p className="text-[11px] text-amber-600 font-medium">Customer requested a call within 10 minutes.</p>
                                        </div>
                                    )}
                                </div>
                            </AdminCard>
                        ) : (
                            <div className="h-full min-h-[400px] border-2 border-dashed border-brand-border rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white/30">
                                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-foreground/20 mb-4">
                                    <Mail size={32} />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-accent mb-1">Select an Inquiry</h3>
                                <p className="text-foreground/40 text-sm">Pick a message from the list to view details and reply.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ProtectedInquiriesPage() {
    return (
        <AuthGuard>
            <InquiriesPage />
        </AuthGuard>
    );
}
