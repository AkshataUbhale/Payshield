import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Clock, DollarSign, Briefcase,
  CheckCircle, User, Send
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import SkillTag from "../../components/freelancers/SkillTag";
import { daysLeft, formatUSDC } from "../../utils/helpers";

const JOBS = {
  1: { id: 1, title: "React Developer Needed", budget: 500, skills: ["React", "Node.js", "TypeScript"],
    deadline: "2026-03-25", status: "Open", clientName: "TechCorp Inc.", clientRating: 4.8, contractsPosted: 12,
    description: `We are looking for an experienced React developer to build a modern analytics dashboard. 

The scope includes:
- Responsive frontend with React + Vite
- Node.js REST API backend
- Integration with our existing PostgreSQL database
- Clean, component-based architecture

We prefer candidates with strong TypeScript skills and experience with charting libraries.` },
  2: { id: 2, title: "Solidity Smart Contract Dev", budget: 1200, skills: ["Solidity", "Ethereum", "Web3", "DeFi"],
    deadline: "2026-04-01", status: "Open", clientName: "DeFi Labs", clientRating: 4.6, contractsPosted: 8,
    description: "Develop ERC-20 token contract with staking and multi-sig capabilities on Ethereum mainnet." },
  3: { id: 3, title: "UI/UX Designer for SaaS", budget: 350, skills: ["Figma", "UI/UX", "Prototyping"],
    deadline: "2026-03-20", status: "Open", clientName: "StartupHQ", clientRating: 5.0, contractsPosted: 4,
    description: "Design comprehensive user flows and high-fidelity mockups for our B2B SaaS product." },
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = JOBS[id] || JOBS[1];
  const [applied, setApplied] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Job Details</span>
            <span className="topbar-breadcrumb">{job.title}</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Main content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{job.title}</h1>
                  <span className="badge badge-active">{job.status}</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {job.skills.map(s => <SkillTag key={s} skill={s} size="md" />)}
                </div>

                <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  {job.description}
                </div>
              </div>

              {/* Requirements / checklist */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Requirements</h3>
                {[
                  "Strong portfolio with relevant work samples",
                  "Delivered on-time in previous contracts",
                  "Clear communication and status updates",
                  "IPFS deliverable submission required",
                ].map(r => (
                  <div key={r} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <CheckCircle size={14} style={{ color: "var(--accent-green)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Budget & Deadline */}
              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>BUDGET</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 6 }}>
                    <DollarSign size={20} />{formatUSDC(job.budget)}
                  </div>
                </div>
                <div className="divider" style={{ margin: "16px 0" }} />
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5 }}>DEADLINE</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                      <Clock size={13} style={{ color: "var(--accent-amber)" }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{daysLeft(job.deadline)}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5 }}>PAYMENT</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>USDC (Escrow)</div>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>About the Client</h3>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "linear-gradient(135deg,#06b6d4,#3b82f6)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Briefcase size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{job.clientName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>⭐ {job.clientRating} · {job.contractsPosted} contracts</div>
                  </div>
                </div>
              </div>

              {/* Apply CTA */}
              {!applied ? (
                <button
                  id="btn-apply-job"
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%" }}
                  onClick={() => navigate(`/freelancer/apply/${job.id}`)}
                >
                  <Send size={16} /> Apply for this Job
                </button>
              ) : (
                <div style={{
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: 12, padding: "14px 20px", textAlign: "center"
                }}>
                  <CheckCircle size={20} style={{ color: "var(--accent-green)", marginBottom: 6 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-green)" }}>Application Submitted!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
