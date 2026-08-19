import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Code2, Briefcase, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { saveUserRole } from "../../services/api";

export default function OnboardingRole() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { publicKey } = useWallet();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("ps_selected_role") || user?.role;
    if (savedRole && (savedRole === "freelancer" || savedRole === "client")) {
      setRole(savedRole);
    }
  }, [user]);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem("ps_selected_role", selectedRole);
  };

  const handleContinue = async () => {
    if (!role) return;
    setLoading(true);

    try {
      const token = sessionStorage.getItem("ps_token");
      const pubkeyStr = publicKey?.toBase58 ? publicKey.toBase58() : user?.walletAddress;

      if (pubkeyStr || token) {
        await saveUserRole({ role, publicKey: pubkeyStr }, token).catch((e) =>
          console.warn("Backend role sync note:", e.message)
        );
      }

      if (user) {
        updateUser({ role });
      }

      localStorage.setItem("userRole", role);
      navigate(role === "freelancer" ? "/onboarding/freelancer" : "/onboarding/client");
    } catch (err) {
      console.error("Error setting role:", err);
      // Fallback navigation
      navigate(role === "freelancer" ? "/onboarding/freelancer" : "/onboarding/client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary, #0f172a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background radial glowing effects */}
      <div
        style={{
          position: "fixed",
          top: "-15%",
          left: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-15%",
          right: "-10%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.1), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 720,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              margin: "0 auto 16px",
              background: "linear-gradient(135deg, #6366f1, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
            }}
          >
            <Shield size={26} color="white" />
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: "#a5b4fc",
              marginBottom: 12,
            }}
          >
            <Sparkles size={13} />
            <span>Classic Onboarding</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary, #ffffff)", marginBottom: 8 }}>
            Choose Your Platform Role
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary, #94a3b8)", maxWidth: 480, margin: "0 auto" }}>
            Select how you want to participate in the PayShield ecosystem. We will customize your workspace and escrow tools.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {/* Freelancer Card */}
          <div
            id="role-card-freelancer"
            onClick={() => handleSelectRole("freelancer")}
            style={{
              background:
                role === "freelancer"
                  ? "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.08))"
                  : "var(--bg-card, #1e293b)",
              border:
                role === "freelancer"
                  ? "2px solid var(--accent-purple, #6366f1)"
                  : "1px solid var(--border, rgba(255, 255, 255, 0.1))",
              borderRadius: 16,
              padding: 24,
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow:
                role === "freelancer"
                  ? "0 0 28px rgba(99, 102, 241, 0.25)"
                  : "0 4px 12px rgba(0, 0, 0, 0.2)",
              position: "relative",
              transform: role === "freelancer" ? "translateY(-2px)" : "none",
            }}
          >
            {role === "freelancer" && (
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  color: "var(--accent-purple, #6366f1)",
                }}
              >
                <CheckCircle2 size={22} />
              </div>
            )}

            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background:
                  role === "freelancer"
                    ? "linear-gradient(135deg, #6366f1, #3b82f6)"
                    : "rgba(255, 255, 255, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                transition: "all 0.2s ease",
              }}
            >
              <Code2 size={24} color={role === "freelancer" ? "#ffffff" : "#94a3b8"} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary, #ffffff)", marginBottom: 6 }}>
              Freelancer
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.5, marginBottom: 14 }}>
              "I want to offer my skills and find work."
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", lineHeight: 1.5, margin: 0 }}>
              Earn crypto payouts by completing verified milestone projects with automated escrow protection.
            </p>
          </div>

          {/* Client Card */}
          <div
            id="role-card-client"
            onClick={() => handleSelectRole("client")}
            style={{
              background:
                role === "client"
                  ? "linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.08))"
                  : "var(--bg-card, #1e293b)",
              border:
                role === "client"
                  ? "2px solid var(--accent-cyan, #06b6d4)"
                  : "1px solid var(--border, rgba(255, 255, 255, 0.1))",
              borderRadius: 16,
              padding: 24,
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow:
                role === "client"
                  ? "0 0 28px rgba(6, 182, 212, 0.25)"
                  : "0 4px 12px rgba(0, 0, 0, 0.2)",
              position: "relative",
              transform: role === "client" ? "translateY(-2px)" : "none",
            }}
          >
            {role === "client" && (
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  color: "var(--accent-cyan, #06b6d4)",
                }}
              >
                <CheckCircle2 size={22} />
              </div>
            )}

            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background:
                  role === "client"
                    ? "linear-gradient(135deg, #06b6d4, #3b82f6)"
                    : "rgba(255, 255, 255, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                transition: "all 0.2s ease",
              }}
            >
              <Briefcase size={24} color={role === "client" ? "#ffffff" : "#94a3b8"} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary, #ffffff)", marginBottom: 6 }}>
              Client
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.5, marginBottom: 14 }}>
              "I want to hire freelancers for my projects."
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", lineHeight: 1.5, margin: 0 }}>
              Post projects, lock funds in secure Solana PDAs, and release payments upon satisfactory delivery.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <button
            id="btn-onboarding-role-continue"
            className="btn btn-primary btn-lg"
            disabled={!role || loading}
            onClick={handleContinue}
            style={{
              width: "100%",
              height: 48,
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: !role ? 0.5 : 1,
              cursor: !role ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                Continue to Profile Setup <ArrowRight size={16} />
              </>
            )}
          </button>

          <span style={{ fontSize: 12, color: "var(--text-muted, #64748b)" }}>
            Step 1 of Onboarding — You can adjust role settings anytime later.
          </span>
        </div>
      </div>
    </div>
  );
}
