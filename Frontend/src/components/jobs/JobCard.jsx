import { Clock, DollarSign } from "lucide-react";
import SkillTag from "../freelancers/SkillTag";
import { daysLeft, formatUSDC } from "../../utils/helpers";

export default function JobCard({ job, onClick }) {
  const { title, budget, skills = [], deadline, status = "Open", clientName, description } = job;
  return (
    <div
      className="card"
      style={{ cursor: "pointer", transition: "all 0.25s ease" }}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
            {title}
          </div>
          {clientName && (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{clientName}</div>
          )}
        </div>
        <span className="badge badge-active" style={{ flexShrink: 0 }}>{status}</span>
      </div>

      {/* Description */}
      {description && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14, 
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {description}
        </p>
      )}

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {skills.slice(0, 5).map(s => <SkillTag key={s} skill={s} />)}
        {skills.length > 5 && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>+{skills.length - 5} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex-between">
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--accent-green)", fontWeight: 700, fontSize: 15 }}>
          <DollarSign size={14} />
          {formatUSDC(budget)}
        </div>
        {deadline && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}>
            <Clock size={12} />
            {daysLeft(deadline)}
          </div>
        )}
      </div>
    </div>
  );
}
