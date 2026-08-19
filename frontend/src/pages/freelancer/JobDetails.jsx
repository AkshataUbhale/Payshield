import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Clock, DollarSign, Briefcase,
  CheckCircle, User, Send, ShieldAlert
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import SkillTag from "../../components/freelancers/SkillTag";
import { daysLeft, formatUSDC } from "../../utils/helpers";
import { getContract } from "../../services/api";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("ps_token");
    setLoading(true);
    getContract(id, token)
      .then((data) => {
        if (!data) throw new Error("Project not found");
        setJob({
          id: data.projectId || data._id,
          title: data.title,
          description: data.description,
          budget: data.budget,
          deadline: data.deadline,
          status: data.status,
          skills: data.skills || [],
          clientPubkey: data.clientPubkey,
          clientName: data.clientPubkey
            ? `Client (${data.clientPubkey.slice(0, 6)}...${data.clientPubkey.slice(-4)})`
            : "Verified Client",
          clientRating: 5.0,
          proposals: data.proposals || [],
        });
      })
      .catch((err) => {
        console.error("Failed to load project:", err);
        setError("Project details could not be retrieved or project does not exist.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div
          className="main-content"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "85vh" }}
        >
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <div className="page-container" style={{ textAlign: "center", padding: "4rem" }}>
            <ShieldAlert size={48} style={{ color: "var(--accent-red)", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Job Not Found</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>{error || "The requested job was not found."}</p>
            <button className="btn btn-primary" onClick={() => navigate("/freelancer/jobs")}>
              <ArrowLeft size={14} /> Back to Job List
            </button>
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
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <span
                    className={`badge badge-${
                      job.status === "open" ? "green" : job.status === "in_progress" ? "purple" : "blue"
                    }`}
                  >
                    {job.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                    {job.deadline ? `Due ${new Date(job.deadline).toLocaleDateString()}` : "Flexible timeline"}
                  </span>
                </div>

                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{job.title}</h1>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                  {job.skills.map((s) => (
                    <SkillTag key={s} skill={s} />
                  ))}
                </div>

                <div className="divider" />

                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "20px 0 10px" }}>Project Scope & Deliverables</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 14, whiteSpace: "pre-line" }}>
                  {job.description}
                </p>
              </div>

              {/* Proposals section if any */}
              {job.proposals && job.proposals.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                    Proposals Submitted ({job.proposals.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {job.proposals.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="flex-between" style={{ fontSize: 13, fontWeight: 600 }}>
                          <span>
                            Freelancer: {p.freelancerPubkey?.slice(0, 6)}...{p.freelancerPubkey?.slice(-4)}
                          </span>
                          <span style={{ color: "var(--accent-green)" }}>{p.bidAmount} USDC</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                          {p.coverNote || p.coverLetter || "Proposal submitted."}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card">
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Escrow Budget</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "var(--accent-green)", marginBottom: 16 }}>
                  {formatUSDC(job.budget)} USDC
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => navigate(`/apply/${job.id}`)}
                    disabled={job.status !== "open"}
                  >
                    <Send size={14} /> {job.status === "open" ? "Apply for this Job" : "Job No Longer Open"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => navigate(`/chat`)}
                  >
                    Message Client
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>About the Client</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(99,102,241,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-purple)",
                    }}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{job.clientName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Public Key: {job.clientPubkey?.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
