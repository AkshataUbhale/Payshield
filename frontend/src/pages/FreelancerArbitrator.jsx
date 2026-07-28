import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import * as api from "../services/api";
import { Bot, Scale, ShieldAlert, ArrowLeft } from "lucide-react";

export default function FreelancerArbitrator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    userRole: "freelancer",
    projectName: "",
    clientName: "",
    milestoneName: "",
    paymentAmount: "",
    workCompleted: "",
    clientIssue: "",
    freelancerExplanation: "",
  });

  const dispute = location.state?.dispute;

  useEffect(() => {
    if (dispute) {
      const fetchDetails = async () => {
        try {
          const token = sessionStorage.getItem("ps_user")
            ? JSON.parse(sessionStorage.getItem("ps_user")).token
            : null;
          
          // Fetch additional project details
          const project = await api.getContract(dispute.projectId, token);
          
          setFormData((prev) => ({
            ...prev,
            projectName: project?.title || `Project #${dispute.projectId}`,
            clientName: project?.clientPubkey || "Client",
            milestoneName: `Milestone #${dispute.milestoneIndex}`,
            paymentAmount: project?.budget ? `${project.budget} USDC` : "Vested Escrow",
            clientIssue: dispute.issue || "",
          }));
        } catch (err) {
          console.error("Failed to load contract details for arbitrator:", err);
          // Fallback from state
          setFormData((prev) => ({
            ...prev,
            projectName: `Project #${dispute.projectId}`,
            clientName: "Client",
            milestoneName: `Milestone #${dispute.milestoneIndex}`,
            paymentAmount: "Vested Escrow",
            clientIssue: dispute.issue || "",
          }));
        }
      };
      fetchDetails();
    }
  }, [dispute]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    setErrorMsg("");
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5001/api/arbitrator/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Arbitrator service failed to analyze.");
      }

      navigate("/arbitration-result", {
        state: {
          formData,
          aiDecision: data.aiDecision,
        },
      });
    } catch (err) {
      console.error("AI Analysis error:", err);
      setErrorMsg(err.message || "Failed to contact the AI Arbitrator service. Make sure backend is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Freelancer AI Arbitrator Form</span>
            <span className="topbar-breadcrumb">Disputes / Freelancer Arbitrator</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dispute")}>
              <ArrowLeft size={14} style={{ marginRight: 6 }} /> Back to Disputes
            </button>
          </div>
        </div>

        <div className="page-container" style={{ maxWidth: 800 }}>
          {/* Header Panel */}
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 16, padding: "20px 24px", marginBottom: 24,
            display: "flex", alignItems: "flex-start", gap: 14
          }}>
            <Bot size={24} style={{ color: "var(--accent-purple)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span>Impartial Cognitive AI Arbitrator</span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                  background: "rgba(99,102,241,0.15)", color: "#a5b4fc"
                }}>READY</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Please review your prefilled dispute details and explain your side of the project.
                Explain the work completed and any issues that arose. The AI will formulate an impartial split resolution.
              </div>
            </div>
          </div>

          {errorMsg && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid var(--accent-red)",
              borderRadius: 12, padding: "16px 20px", marginBottom: 24,
              display: "flex", alignItems: "center", gap: 10, color: "#f87171", fontSize: 13
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <Scale size={20} style={{ color: "var(--accent-purple)" }} />
              Submit Freelancer Dispute Statement
            </h2>

            {/* Read-Only Prefills */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Project Name</label>
                <input
                  name="projectName"
                  className="form-input"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="Project Name"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Client Wallet / Name</label>
                <input
                  name="clientName"
                  className="form-input"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Client Wallet / Name"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Milestone Identifier</label>
                <input
                  name="milestoneName"
                  className="form-input"
                  value={formData.milestoneName}
                  onChange={handleChange}
                  placeholder="Milestone"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Vested Escrow Amount</label>
                <input
                  name="paymentAmount"
                  className="form-input"
                  value={formData.paymentAmount}
                  onChange={handleChange}
                  placeholder="Budget"
                />
              </div>
            </div>

            {/* Interactive Inputs */}
            <div className="form-group">
              <label className="form-label">Client's Lodged Issue *</label>
              <textarea
                name="clientIssue"
                className="form-textarea"
                style={{ minHeight: 100 }}
                value={formData.clientIssue}
                onChange={handleChange}
                placeholder="The dispute complaint raised by the client..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">What Work Did You Complete? *</label>
              <textarea
                name="workCompleted"
                className="form-textarea"
                style={{ minHeight: 100 }}
                value={formData.workCompleted}
                onChange={handleChange}
                placeholder="Explain the actual deliverables, code files, or mockups completed..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label">Your Explanation / Counter-Statement *</label>
              <textarea
                name="freelancerExplanation"
                className="form-textarea"
                style={{ minHeight: 100 }}
                value={formData.freelancerExplanation}
                onChange={handleChange}
                placeholder="Provide details about why the delivery was delayed, completed correctly, or what communication occurred..."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                className="btn btn-ghost"
                onClick={() => navigate("/dispute")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={loading || !formData.freelancerExplanation}
              >
                {loading ? "Analyzing Dispute..." : "✦ Run Cognitive Analysis"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
