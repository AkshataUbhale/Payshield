import { ExternalLink } from "lucide-react";

export default function PortfolioCard({ item }) {
  const { title, description, link, tech = [] } = item;
  return (
    <div className="card card-sm" style={{
      background: "rgba(99,102,241,0.05)",
      border: "1px solid rgba(99,102,241,0.15)",
    }}>
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        {link && (
          <a href={link} target="_blank" rel="noreferrer"
            style={{ color: "var(--accent-purple)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
            <ExternalLink size={12} /> View
          </a>
        )}
      </div>
      {description && (
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>
          {description}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {tech.map(t => (
          <span key={t} style={{
            padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
            background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)",
            border: "1px solid rgba(59,130,246,0.2)"
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
