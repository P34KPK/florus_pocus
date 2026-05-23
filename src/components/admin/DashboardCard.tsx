import type { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "green" | "orange" | "blue" | "purple";
}

const COLOR_MAP = {
  green:  { bg: "#E8F0E0", icon: "#2D5016" },
  orange: { bg: "#FDF5EC", icon: "#D4A574" },
  blue:   { bg: "#E8F0F5", icon: "#2D7016" },
  purple: { bg: "#F5E8F0", icon: "#702D50" },
};

export default function DashboardCard({ title, value, subtitle, icon: Icon, trend, color = "green" }: DashboardCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: colors.bg }}
        >
          <Icon size={20} style={{ color: colors.icon }} />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.value >= 0 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>

      <p className="text-sm text-[#1A1A1A] opacity-50 mb-1">{title}</p>
      <p className="font-heading font-bold text-3xl text-[#1A1A1A]">{value}</p>
      {subtitle && <p className="text-xs opacity-40 mt-1">{subtitle}</p>}
    </div>
  );
}
