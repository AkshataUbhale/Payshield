import { Clock, Activity, CheckCircle, AlertTriangle, FileText } from "lucide-react";

const ICON_MAP = {
  "Contract Created": FileText,
  "Payment Released": CheckCircle,
  "Work Submitted": Activity,
  "Dispute Raised": AlertTriangle,
  "Job Applied": FileText,
  "Freelancer Hired": CheckCircle,
  "Escrow Locked": FileText,
};

const COLOR_MAP = {
  "Contract Created": "purple",
  "Payment Released": "green",
  "Work Submitted": "blue",
  "Dispute Raised": "amber",
  "Job Applied": "blue",
  "Freelancer Hired": "green",
  "Escrow Locked": "purple",
};

export default function ActivityFeed({ items = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {items.map((a, i) => {
        const Icon = ICON_MAP[a.type] || Activity;
        const color = COLOR_MAP[a.type] || "blue";
        return (
          <div
            key={i}
            className="milestone-item"
            style={{ padding: "14px 0" }}
          >
            <div className={`stat-icon ${color}`} style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }}>
              <Icon size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{a.type}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.desc}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
              <Clock size={10} /> {a.time}
            </div>
          </div>
        );
      })}
    </div>
  );
}
