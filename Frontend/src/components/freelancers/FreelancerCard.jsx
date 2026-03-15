import { Star, MapPin } from "lucide-react";
import SkillTag from "./SkillTag";

export default function FreelancerCard({ freelancer, onClick }) {
  const { name, skills = [], rating = 4.5, hourlyRate, completedJobs = 0, bio, location } = freelancer;

  const stars = Math.round(rating);

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
      {/* Avatar + name */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#6366f1,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, color: "white"
        }}>
          {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{name}</div>
          {location && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--text-muted)" }}>
              <MapPin size={11} /> {location}
            </div>
          )}
        </div>
        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Star size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{rating.toFixed(1)}</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({completedJobs})</span>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p style={{
          fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
        }}>
          {bio}
        </p>
      )}

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {skills.slice(0, 4).map(s => <SkillTag key={s} skill={s} />)}
        {skills.length > 4 && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>+{skills.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex-between">
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-green)" }}>
          {hourlyRate ? `$${hourlyRate}/hr` : "Negotiable"}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {completedJobs} job{completedJobs !== 1 ? "s" : ""} done
        </div>
      </div>
    </div>
  );
}
