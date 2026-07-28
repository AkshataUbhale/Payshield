import { useLocation, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Bot, Scale, ShieldAlert, CheckCircle, FileText, ArrowRight } from "lucide-react";

export default function ArbitrationResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state?.formData;
  const aiDecision = location.state?.aiDecision;

  if (!data) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-left">
              <span className="topbar-title">AI Arbitration Result</span>
              <span className="topbar-breadcrumb">Disputes / Result</span>
            </div>
          </div>
          <div className="page-container" style={{ maxWidth: 600 }}>
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <ShieldAlert size={40} style={{ color: "var(--accent-red)", margin: "0 auto 16px", display: "block" }} />
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>No Dispute Data Found</h1>
              <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 14 }}>
                Please submit an AI arbitrator statement first to view the resolution result.
              </p>
              <button className="btn btn-primary" onClick={() => navigate("/dispute")}>
                Go to Dispute Center
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isClient = data.userRole === "client";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">AI Arbitration Result</span>
            <span className="topbar-breadcrumb">Disputes / Case Resolution</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dispute")}>
              Back to Dispute Center <ArrowRight size={14} style={{ marginLeft: 6 }} />
            </button>
          </div>
        </div>

        <div className="page-container" style={{ maxWidth: 900 }}>
          <div className="card animate-fadeInUp">
            {/* Header Banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.06))",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 16, padding: "24px", marginBottom: 28,
              display: "flex", alignItems: "flex-start", gap: 16
            }}>
              <CheckCircle size={28} style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                  Impartial AI Resolution Generated
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Our AI Arbitrator has successfully scanned the milestone parameters, expected vs. actual work deliverables, and issued an equitable payout recommendation below.
                </div>
              </div>
            </div>

            {/* Case Details */}
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
              Disputed Case Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>PROJECT NAME</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{data.projectName}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>MILESTONE</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{data.milestoneName}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>ESCROW AMOUNT</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-green)" }}>{data.paymentAmount}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                  {isClient ? "FREELANCER" : "CLIENT"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>
                  {isClient ? `${data.freelancerName.slice(0,6)}...${data.freelancerName.slice(-4)}` : data.clientName}
                </span>
              </div>
            </div>

            {/* AI Decision Box */}
            <div style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.05))",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 16, padding: "24px 28px", marginBottom: 28
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#a5b4fc", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Bot size={20} style={{ color: "#818cf8" }} />
                AI Arbitrator Recommendation & Analysis
              </h2>
              <div style={{
                fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7,
                whiteSpace: "pre-wrap", fontFamily: "inherit"
              }}>
                {aiDecision || "No recommendation was received. Please retry analysis."}
              </div>
            </div>

            {/* Statements Recap */}
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
              Dispute Statement Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
                  {isClient ? "CLIENT COMPLAINT" : "CLIENT ISSUE"}
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  {isClient ? data.clientComplaint : data.clientIssue}
                </p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
                  {isClient ? "EXPECTED WORK DELIVERABLE" : "WORK COMPLETED"}
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  {isClient ? data.expectedWork : data.workCompleted}
                </p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
                  {isClient ? "DELIVERABLE WORK RECEIVED" : "FREELANCER COUNTER-EXPLANATION"}
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                  {isClient ? data.workReceived : data.freelancerExplanation}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/dispute")}>
                Return to Dispute Thread
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
