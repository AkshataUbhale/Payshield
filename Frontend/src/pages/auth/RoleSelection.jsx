import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Code2, Briefcase, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user, login, loginWithWallet, updateUser } = useAuth();
  const { connect } = useWallet();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: "freelancer",
      icon: Code2,
      title: "I'm a Freelancer",
      subtitle: "I want to find jobs, get hired, and receive payments securely.",
      features: ["Browse skill-matched jobs", "Submit deliverables via IPFS", "Get paid via smart contract"],
      color: "purple",
      gradient: "linear-gradient(135deg,#6366f1,#3b82f6)",
    },
    {
      id: "client",
      icon: Briefcase,
      title: "I'm Hiring",
      subtitle: "I want to post jobs, hire freelancers, and manage escrow contracts.",
      features: ["Post jobs and find talent", "Create escrow contracts", "Release payment on approval"],
      color: "cyan",
      gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
    },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (user) {
      updateUser({ role: selected });
    }
    setLoading(false);
    navigate(selected === "freelancer" ? "/freelancer/dashboard" : "/client/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative"
    }}>
      {/* Glow blobs */}
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-15%", right: "-5%", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(6,182,212,0.05),transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 700, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)"
          }}>
            <Shield size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>How will you use PayShield?</h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
            Choose your role to get a personalized experience.
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
          {roles.map(r => (
            <div
              key={r.id}
              id={`role-${r.id}`}
              onClick={() => setSelected(r.id)}
              style={{
                background: selected === r.id
                  ? "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(59,130,246,0.08))"
                  : "var(--bg-card)",
                border: `2px solid ${selected === r.id ? "var(--accent-purple)" : "var(--border)"}`,
                borderRadius: 16, padding: 28,
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: selected === r.id ? "0 0 32px rgba(99,102,241,0.2)" : "var(--shadow-card)",
                position: "relative", overflow: "hidden"
              }}
            >
              {selected === r.id && (
                <div style={{
                  position: "absolute", top: 12, right: 14,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "var(--accent-purple)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <span style={{ color: "white", fontSize: 11 }}>✓</span>
                </div>
              )}

              <div style={{
                width: 48, height: 48, borderRadius: 12, marginBottom: 16,
                background: selected === r.id ? r.gradient : "rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s ease"
              }}>
                <r.icon size={22} color={selected === r.id ? "white" : "var(--text-muted)"} />
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{r.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                {r.subtitle}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {r.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: selected === r.id ? "var(--accent-purple)" : "var(--text-muted)"
                    }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          id="btn-role-continue"
          className="btn btn-primary btn-lg"
          disabled={!selected || loading}
          onClick={handleContinue}
          style={{ width: "100%" }}
        >
          {loading ? <span className="spinner" /> : <>Continue as {selected === "client" ? "Client" : selected === "freelancer" ? "Freelancer" : "…"} <ArrowRight size={16} /></>}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
          You can switch your role anytime in Settings.
        </p>
      </div>
    </div>
  );
}
