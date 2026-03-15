import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, DollarSign } from "lucide-react";
import Sidebar from "../../components/Sidebar";

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ proposal: "", bid: "", timeline: "", experience: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.proposal || !form.bid) { alert("Please fill proposal and bid amount."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
            <div className="card" style={{ maxWidth: 420, textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Application Submitted!</h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 28 }}>
                Your proposal has been sent to the client. You'll receive a notification when they respond.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate("/freelancer/jobs")}>
                  Browse More Jobs
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate("/freelancer/dashboard")}>
                  Go to Dashboard
                </button>
              </div>
            </div>
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
            <span className="topbar-title">Apply for Job</span>
            <span className="topbar-breadcrumb">Write a compelling proposal</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        <div className="page-container">
          <div style={{ maxWidth: 680 }}>
            <div className="card">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Write Your Proposal</h2>

              {/* Bid Amount */}
              <div className="form-group">
                <label className="form-label">Your Bid Amount (USDC)</label>
                <div className="input-group">
                  <DollarSign className="input-icon" size={15} />
                  <input id="input-bid" type="number" className="form-input input-with-icon"
                    placeholder="e.g. 450" value={form.bid} onChange={set("bid")} />
                  <span className="input-suffix">USDC</span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Client budget: 500 USDC</span>
              </div>

              {/* Timeline */}
              <div className="form-group">
                <label className="form-label">Estimated Delivery</label>
                <select id="select-timeline" className="form-select" value={form.timeline} onChange={set("timeline")}>
                  <option value="">Select delivery time…</option>
                  <option>3 days</option>
                  <option>5 days</option>
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>1 month</option>
                </select>
              </div>

              {/* Proposal */}
              <div className="form-group">
                <label className="form-label">Cover Letter / Proposal</label>
                <textarea id="input-proposal" className="form-textarea" rows={7}
                  placeholder="Describe your approach, relevant experience, and why you're a great fit for this project…"
                  value={form.proposal} onChange={set("proposal")} style={{ minHeight: 180 }} />
              </div>

              {/* Relevant Experience */}
              <div className="form-group">
                <label className="form-label">Relevant Experience (Optional)</label>
                <textarea className="form-textarea" rows={3}
                  placeholder="Share links to similar work, GitHub repos, or past projects…"
                  value={form.experience} onChange={set("experience")} />
              </div>

              {/* Info */}
              <div style={{
                background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "var(--text-secondary)"
              }}>
                💡 <strong>PayShield protects you</strong> — payment is held in escrow until you deliver and the client approves.
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>Cancel</button>
                <button id="btn-submit-proposal" className="btn btn-primary" style={{ flex: 2 }}
                  onClick={handleSubmit} disabled={loading}>
                  {loading ? <span className="spinner" /> : <><Send size={15} /> Submit Proposal</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
