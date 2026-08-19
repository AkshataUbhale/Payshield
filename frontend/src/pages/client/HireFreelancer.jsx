import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Star, Shield, Send } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import FreelancerCard from "../../components/freelancers/FreelancerCard";
import PortfolioCard from "../../components/freelancers/PortfolioCard";
import Modal from "../../components/common/Modal";
import * as api from "../../services/api";

export default function HireFreelancer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", budget: "", message: "" });
  const [hired, setHired] = useState(false);

  useEffect(() => {
    async function loadFreelancer() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        const res = await api.getFreelancers(token);
        const list = Array.isArray(res) ? res : res.freelancers || [];
        const match = list.find((f) => f.publicKey === id || f._id === id);
        if (match) {
          setFreelancer({
            id: match.publicKey || match._id,
            name: match.name || match.username || `Developer (${match.publicKey?.slice(0, 6)}...${match.publicKey?.slice(-4)})`,
            skills: match.skills || ["Solana", "Web3", "Full-Stack"],
            rating: 5.0,
            hourlyRate: match.hourlyRate || 50,
            completedJobs: match.completedProjects || 0,
            bio: match.bio || "Full-stack developer specializing in Solana smart contracts and decentralized applications.",
            location: match.location || "Decentralized / Remote",
            portfolio: [],
          });
        } else {
          setFreelancer({
            id: id || "Unknown",
            name: `Developer (${id?.slice(0, 6)}...${id?.slice(-4)})`,
            skills: ["Solana", "Web3"],
            rating: 5.0,
            hourlyRate: 50,
            completedJobs: 0,
            bio: "Verified developer ready for escrow contract assignment.",
            location: "Remote",
            portfolio: [],
          });
        }
      } catch (err) {
        console.error("Failed to load freelancer details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFreelancer();
  }, [id]);

  const handleHire = () => {
    setShowModal(false);
    setHired(true);
    setTimeout(() => {
      navigate("/create", {
        state: {
          freelancerPubkey: freelancer?.id,
          title: form.title,
          budget: form.budget,
        },
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <div className="page-container" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
            Loading developer details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Hire Freelancer</span>
            <span className="topbar-breadcrumb">{freelancer?.name}</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Left: profile */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {freelancer && <FreelancerCard freelancer={freelancer} />}

              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Security & Escrow Guarantee</h3>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Shield size={20} style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                    Hiring on PayShield locks your funds into an autonomous Solana PDA escrow. Funds are only released
                    once you review deliverables or AI Proof-of-Work completes with zero disputes.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: hire panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {hired ? (
                <div className="card" style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Proposal Accepted!</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                    Redirecting to initialize Solana Devnet Escrow PDA…
                  </p>
                </div>
              ) : (
                <div className="card">
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Send a Direct Job Offer</h3>
                  <div className="form-group">
                    <label className="form-label">Project Title</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Full-Stack Solana Escrow & AI Platform"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Escrow Budget (USDC / SOL)</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="e.g. 500"
                      value={form.budget}
                      onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Project Scope / Milestone Note</label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      placeholder="Describe what deliverables you expect for this milestone..."
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => setShowModal(true)}
                    disabled={!form.title || !form.budget}
                  >
                    <Send size={14} /> Send Escrow Job Offer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Confirm Job Offer"
            onConfirm={handleHire}
            confirmText="Proceed to Escrow Deposit"
          >
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              You are offering <strong>{form.title}</strong> with a budget of{" "}
              <strong style={{ color: "var(--accent-green)" }}>{form.budget} USDC</strong> to{" "}
              <strong>{freelancer?.name}</strong>.
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
              Clicking proceed will take you to deposit funds into the Solana escrow contract.
            </p>
          </Modal>
        )}
      </div>
    </div>
  );
}
