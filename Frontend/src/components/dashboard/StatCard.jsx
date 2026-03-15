import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ label, value, icon: Icon, color = "purple", change, up = true }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${up ? "up" : "down"}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </div>
      )}
    </div>
  );
}
