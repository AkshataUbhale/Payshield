import { CheckCircle, Clock, Lock } from "lucide-react";

const STATUS_CONFIG = {
  "Escrow Locked":  { color: "var(--accent-amber)", icon: Lock,         bg: "rgba(245,158,11,0.1)"  },
  "Active":         { color: "var(--accent-green)", icon: CheckCircle,  bg: "rgba(16,185,129,0.1)"  },
  "Pending":        { color: "var(--accent-blue)",  icon: Clock,        bg: "rgba(59,130,246,0.1)"  },
  "Submitted":      { color: "var(--accent-blue)",  icon: CheckCircle,  bg: "rgba(59,130,246,0.1)"  },
  "Released":       { color: "var(--accent-purple)",icon: CheckCircle,  bg: "rgba(99,102,241,0.1)"  },
  "Disputed":       { color: "var(--accent-red)",   icon: Clock,        bg: "rgba(239,68,68,0.1)"   },
};

export default function EscrowStatus({ status = "Pending", contractAddress }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  const Icon = cfg.icon;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: cfg.bg, border: `1px solid ${cfg.color}33`,
      borderRadius: 10, padding: "8px 14px",
    }}>
      <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{status}</div>
        {contractAddress && (
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Courier New',monospace", marginTop: 1 }}>
            {contractAddress.slice(0,10)}…{contractAddress.slice(-6)}
          </div>
        )}
      </div>
    </div>
  );
}
