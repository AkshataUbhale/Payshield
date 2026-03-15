import { ExternalLink, Clock, ArrowRight } from "lucide-react";

const statusClass = {
  Active:    "badge-active",
  Pending:   "badge-pending",
  Disputed:  "badge-disputed",
  Completed: "badge-completed",
  Submitted: "badge-submitted",
};

export default function ContractCard({ contract, onClick }) {
  const {
    id, title, freelancer, client, amount, currency = "USDC",
    status, milestone, progress = 0, createdAt, description
  } = contract;

  return (
    <div
      className={`contract-card ${status?.toLowerCase()}`}
      onClick={onClick}
      id={`contract-card-${id}`}
    >
      {/* Header */}
      <div className="flex-between mb-4">
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
            {title || `Contract #${id}`}
          </h3>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{createdAt || "Mar 12, 2025"}</span>
        </div>
        <span className={`badge ${statusClass[status] || "badge-pending"}`}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "currentColor", display: "inline-block"
          }} />
          {status}
        </span>
      </div>

      {/* Participants */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 12, marginBottom: 16
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, fontWeight: 600, letterSpacing: 0.5 }}>
            FREELANCER
          </div>
          <div style={{
            fontSize: 12, fontFamily: "'Courier New', monospace",
            color: "var(--text-secondary)"
          }}>
            {freelancer}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, fontWeight: 600, letterSpacing: 0.5 }}>
            AMOUNT
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-green)" }}>
            {amount} <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{currency}</span>
          </div>
        </div>
      </div>

      {/* Milestone */}
      {milestone && (
        <div style={{ marginBottom: 16 }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} /> {milestone}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
              {progress}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${status === "Completed" ? "green" : "purple"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
          {description.length > 80 ? `${description.slice(0, 80)}...` : description}
        </p>
      )}

      {/* Footer */}
      <div className="flex-between" style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 4 }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          ID: #{String(id).padStart(4, "0")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent-purple)", fontWeight: 600 }}>
          View Details <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}
