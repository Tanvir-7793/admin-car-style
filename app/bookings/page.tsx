"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AdminCard from "@/components/AdminCard";
import AuthGuard from "@/components/AuthGuard";
import {
  Calendar,
  Car,
  User,
  Phone,
  Circle,
  IndianRupee,
  MessageCircle,
  Clock,
  MapPin,
} from "lucide-react";

interface Booking {
  id: string;
  customerName: string;
  phone?: string;
  service: string;
  car?: string;
  status: string;
  date?: string;
  amount?: number | string | null;
  createdAt?: string;
}

function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/bookings");
        if (!res.ok) {
          throw new Error("Failed to load bookings");
        }
        const data: Booking[] = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load bookings from database.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-secondary/50 font-sans">
      <Sidebar />

      <main className="lg:pl-72 px-4 md:px-8 py-8 transition-all duration-300">
        <Header title="Bookings" />

        <AdminCard className="overflow-hidden">
          {loading && (
            <div className="py-10 text-center">
              <p className="text-foreground/40 font-bold text-sm">
                Loading bookings...
              </p>
            </div>
          )}
          {error && !loading && (
            <div className="py-10 text-center">
              <p className="text-red-500 font-bold text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {bookings.map((b) => {
                  const status =
                    (b.status || "").toLowerCase() as
                      | "scheduled"
                      | "completed"
                      | "cancelled"
                      | string;

                  const statusColor =
                    status === "completed" || status === "accepted"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : status === "cancelled"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-blue-100 text-blue-700 border-blue-200";

                  const statusIcon =
                    status === "completed" || status === "accepted"
                      ? "✓"
                      : status === "cancelled"
                      ? "✕"
                      : "⏱";

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-brand-border/50 p-6 hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                            <User size={20} className="text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-accent text-lg leading-none mb-1">
                              {b.customerName || "Unknown Customer"}
                            </h3>
                            {b.phone && (
                              <div className="flex items-center gap-1 text-sm text-foreground/60 font-medium">
                                <Phone size={12} />
                                {b.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor}`}
                        >
                          <span className="text-xs">{statusIcon}</span>
                          {b.status || "Scheduled"}
                        </span>
                      </div>

                      {/* Service Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-white border border-brand-border flex items-center justify-center text-primary">
                            <Car size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-accent text-sm">
                              {b.service}
                            </div>
                            {b.car && (
                              <div className="text-xs text-foreground/50 font-medium mt-0.5">
                                {b.car}
                              </div>
                            )}
                          </div>
                        </div>

                        {b.date && (
                          <div className="flex items-center gap-3 text-sm text-foreground/60">
                            <Calendar size={16} className="text-primary/50" />
                            <Clock size={14} className="text-primary/50" />
                            <span className="font-medium">{b.date}</span>
                          </div>
                        )}
                        
                        {b.createdAt && (
                          <div className="flex items-center gap-2 text-xs text-foreground/50 font-medium">
                            <span className="text-[10px] uppercase tracking-wider text-foreground/30">Booked on:</span>
                            <span>{new Date(b.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-brand-border/30">
                          {b.amount != null ? (
                            <div className="flex items-center gap-2">
                              <IndianRupee size={16} className="text-primary" />
                              <span className="font-bold text-accent text-lg">
                                {typeof b.amount === "number"
                                  ? b.amount.toLocaleString("en-IN")
                                  : b.amount}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-foreground/40">
                              Amount on enquiry
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {b.phone && (
                          <>
                            <a
                              href={`tel:${b.phone}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Phone size={16} />
                              Call
                            </a>
                            <a
                              href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <MessageCircle size={16} />
                              WhatsApp
                            </a>
                          </>
                        )}
                        {!b.phone && (
                          <div className="flex-1 text-center py-2.5 text-xs text-foreground/40 font-medium bg-secondary/30 rounded-xl">
                            No contact number
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {bookings.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/30 flex items-center justify-center">
                    <Calendar size={32} className="text-foreground/30" />
                  </div>
                  <p className="text-foreground/40 font-bold text-lg mb-2">
                    No bookings found
                  </p>
                  <p className="text-foreground/30 text-sm">
                    When customers book services, they'll appear here
                  </p>
                </div>
              )}
            </>
          )}
        </AdminCard>
      </main>
    </div>
  );
}

export default function ProtectedBookingsPage() {
    return (
        <AuthGuard>
            <BookingsPage />
        </AuthGuard>
    );
}

