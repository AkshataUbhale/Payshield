import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Star, Shield, Send } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import FreelancerCard from "../../components/freelancers/FreelancerCard";
import SkillTag from "../../components/freelancers/SkillTag";
import PortfolioCard from "../../components/freelancers/PortfolioCard";
import Modal from "../../components/common/Modal";

const FREELANCERS = {
  f1: { id: "f1", name: "Alex Johnson", skills: ["React","Node.js","TypeScript","Web3"], rating: 4.9,
    hourlyRate: 45, completedJobs: 34, bio: "Full-stack developer specializing in React and blockchain integrations.", location: "USA",
    portfolio: [
      { title: "DeFi Dashboard", description: "Analytics dashboard with real-time on-chain data.", tech:["React","Web3"], link:"#" },
      { title: "NFT Storefront", description: "Full NFT marketplace front-end and smart contracts.", tech:["Solidity","React"], link:"#" },
    ]
  },
  f2: { id: "f2", name: "Priya Sharma", skills: ["Solidity","Ethereum","Web3","DeFi"], rating: 4.7,
    hourlyRate: 60, completedJobs: 22, bio: "Smart contract developer with 3 years of DeFi and NFT experience.", location: "India",
    portfolio: [
      { title: "ERC-20 Token Suite", description: "Custom token with staking and governance.", tech:["Solidity","Hardhat"], link:"#" },
    ]
  },
};

export default function HireFreelancer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const freelancer = FREELANCERS[id] || FREELANCERS.f1;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", budget: "", message: "" });
  const [hired, setHired] = useState(false);

  const handleHire = () => {
    setShowModal(false);
    setHired(true);
    setTimeout(() => navigate("/create"), 1500);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Hire Freelancer</span>
            <span className="topbar-breadcrumb">{freelancer.name}</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={14}/> Back</button>
          </div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Left: profile */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <FreelancerCard freelancer={freelancer} />

              {/* Portfolio */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Portfolio</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(freelancer.portfolio || []).map(p => <PortfolioCard key={p.title} item={p} />)}
                </div>
              </div>
            </div>

            {/* Right: hire panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {hired ? (
                <div className="card" style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Offer Sent!</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Redirecting to create escrow contract…</p>
                </div>
              ) : (
                <div className="card">
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Send a Job Offer</h3>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="form-input" placeholder="e.g. React Dashboard Build"
                      value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget (USDC)</label>
                    <input className="form-input" type="number" placeholder="500"
                      value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" rows={4}
                      placeholder="Describe your project and why you'd like to hire this freelancer…"
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  <div style={{
                    background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "var(--text-secondary)"
                  }}>
                    <Shield size={13} style={{ display: "inline", marginRight: 6, color: "var(--accent-green)" }} />
                    Payment will be held in escrow until you approve the work.
                  </div>
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setShowModal(true)}>
                    <Send size={15} /> Send Job Offer
                  </button>
                </div>
              )}

              {/* Rates info */}
              <div className="card card-sm">
                <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-purple)" }}>${freelancer.hourlyRate}/hr</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Hourly Rate</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-green)" }}>{freelancer.rating}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Rating</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-blue)" }}>{freelancer.completedJobs}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Jobs Done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showModal && (
        <Modal title="Confirm Job Offer" onClose={() => setShowModal(false)}>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
            You're sending a job offer to <strong>{freelancer.name}</strong> for{" "}
            <strong>{form.budget || "?"} USDC</strong>. After acceptance, you'll create an escrow contract.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleHire}>Confirm & Send</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
