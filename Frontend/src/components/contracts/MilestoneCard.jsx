import { CheckCircle, Clock, Circle } from "lucide-react";

export default function MilestoneCard({ milestone, index }) {
  const { title, amount, status = "Pending", dueDate, description } = milestone;

  const cfg = {
    Completed: { icon: CheckCircle, color: "var(--accent-green)", bg: "rgba(16,185,129,0.1)" },
    Active:    { icon: Clock,       color: "var(--accent-blue)",  bg: "rgba(59,130,246,0.1)" },
    Pending:   { icon: Circle,      color: "var(--text-muted)",   bg: "rgba(255,255,255,0.04)" },
  }[status] || { icon: Circle, color: "var(--text-muted)", bg: "rgba(255,255,255,0.04)" };

  const Icon = cfg.icon;

  return (
    <div style={{
      display: "flex", gap: 14, padding: "14px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: cfg.bg, border: `1px solid ${cfg.color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0
      }}>
        <Icon size={16} style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div className="flex-between" style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            <span style={{ color: "var(--text-muted)", marginRight: 6, fontSize: 12 }}>#{index + 1}</span>
            {title}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-green)" }}>
            {amount} USDC
          </div>
        </div>
        {description && (
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{description}</div>
        )}
        <div className="flex-between">
          <span style={{
            fontSize: 11, fontWeight: 600, color: cfg.color,
            background: cfg.bg, padding: "2px 8px", borderRadius: 20
          }}>
            {status}
          </span>
          {dueDate && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Due: {dueDate}</span>
          )}
        </div>
      </div>
    </div>
  );
}
