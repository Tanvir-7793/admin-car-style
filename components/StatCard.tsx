import { LucideIcon } from "lucide-react";
import AdminCard from "./AdminCard";

interface StatCardProps {
    label: string;
    value: string;
    trend: string;
    icon: LucideIcon;
    trendUp?: boolean;
}

export default function StatCard({ label, value, trend, icon: Icon, trendUp = true }: StatCardProps) {
    return (
        <AdminCard className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0 transition-transform">
                <Icon size={24} className="md:size-[28px]" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-bold text-foreground/40 uppercase tracking-widest mb-0.5 md:mb-1 truncate">{label}</p>
                <h2 className="text-xl md:text-2xl font-bold text-accent mb-0.5 truncate">{value}</h2>
                <p className={`text-[10px] md:text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                    {trend} <span className="text-foreground/40 text-[9px] md:text-[10px] ml-0.5">last month</span>
                </p>
            </div>
        </AdminCard>
    );
}
