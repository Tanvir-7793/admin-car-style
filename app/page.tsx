"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import AdminCard from "@/components/AdminCard";
import AuthGuard from "@/components/AuthGuard";
import {
  Users,
  Car,
  TrendingUp,
  Clock,
  Plus,
  CheckCircle2,
  Calendar
} from "lucide-react";
import Link from "next/link";

interface DashboardInquiry {
  id: string;
  name: string;
  subject: string;
  status: "New" | "Read" | "Replied";
}

function Dashboard() {
  const [recentInquiries, setRecentInquiries] = useState<DashboardInquiry[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [newInquiries, setNewInquiries] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings count
        const bookingsRes = await fetch("/api/bookings");
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setTotalBookings(bookingsData.length);
        }

        // Fetch inquiries
        const inquiriesRes = await fetch("/api/inquiries");
        if (inquiriesRes.ok) {
          const inquiriesData: any[] = await inquiriesRes.json();
          setNewInquiries(inquiriesData.filter(inq => inq.status === 'New').length);
          
          // Set recent inquiries (first 4)
          const mapped: DashboardInquiry[] = inquiriesData
            .slice(0, 4)
            .map((item) => ({
              id: item.id,
              name: item.name,
              subject: item.subject,
              status: item.status,
            }));
          setRecentInquiries(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-secondary/50 font-sans">
      <Sidebar />

      <main className="lg:pl-72 px-4 md:px-8 py-8 transition-all duration-300">
        <Header title="Dashboard" />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          <StatCard
            label="Total Bookings"
            value={loading ? "..." : totalBookings.toString()}
            trend="+12%"
            icon={Car}
            trendUp={true}
          />
          <StatCard
            label="New Inquiries"
            value={loading ? "..." : newInquiries.toString()}
            trend="-3%"
            icon={Users}
            trendUp={false}
          />
        </div>

        {/* Recent Inquiries */}
        <div className="max-w-2xl">
          <AdminCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-accent">Recent Inquiries</h3>
              <Link href="/inquiries">
                <button className="text-primary text-xs font-bold hover:underline">View All</button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-accent">{inquiry.name}</p>
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        inquiry.status === "New"
                          ? "bg-blue-50 text-blue-600"
                          : inquiry.status === "Read"
                          ? "bg-zinc-100 text-zinc-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {inquiry.status}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/60 line-clamp-2">{inquiry.subject}</p>
                </div>
              ))}
              {recentInquiries.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-foreground/40 text-sm">No recent inquiries</p>
                </div>
              )}
            </div>
          </AdminCard>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
