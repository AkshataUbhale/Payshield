import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, CheckCircle, Users, Clock, Plus } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { getContracts, hireFreelancer } from "../../services/api";

const STATUS_COLOR = {
  open: "badge-active",
  in_progress: "badge-submitted",
  completed: "badge-completed",
  cancelled: "badge-disputed",
};

export default function JobManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shortAddress } = useWallet();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobProposals, setSelectedJobProposals] = useState(null);
  const [hiring, setHiring] = useState(false);

  const fetchJobs = () => {
    const token = sessionStorage.getItem("ps_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getContracts({ clientPubkey: user?.walletAddress }, token)
      .then((data) => {
        const list = data.projects ?? data ?? [];
        setJobs(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Failed to load client jobs:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [user?.walletAddress]);

  const handleHireCandidate = async (projectId, freelancerPubkey) => {
    if (!confirm(`Hire freelancer ${freelancerPubkey.slice(0, 6)}...${freelancerPubkey.slice(-4)} for this project?`)) {
      return;
    }
    setHiring(true);
    try {
      const token = sessionStorage.getItem("ps_token");
      await hireFreelancer(projectId, freelancerPubkey, token);
      alert("Freelancer hired successfully! The contract is now in progress.");
      setSelectedJobProposals(null);
      fetchJobs();
    } catch (err) {
      console.error("Failed to hire freelancer:", err);
      alert(err.message || "Failed to hire freelancer.");
    } finally {
      setHiring(false);
    }
  };

  const activeJobs = jobs.filter((j) => j.status === "open");
  const inProgressJobs = jobs.filter((j) => j.status === "in_progress");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  return (
    <div className="app-layout">
      <Sidebar walletAddress={user?.walletAddress || shortAddress} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">My Posted Jobs</span>
            <span className="topbar-breadcrumb">{jobs.length} jobs created</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/post-job")}>
              <Plus size={14} /> Post Job
            </button>
          </div>
        </div>

        <div className="page-container">
          {/* Summary */}
          <div className="grid-4 mb-8">
            {[
              { label: "Total Posted", value: jobs.length, color: "purple" },
              { label: "Open for Bids", value: activeJobs.length, color: "green" },
              { label: "In Progress", value: inProgressJobs.length, color: "blue" },
              { label: "Completed", value: completedJobs.length, color: "amber" },
            ].map((s) => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Proposals Modal View */}
          {selectedJobProposals && (
            <div className="card mb-6 animate-fadeIn" style={{ border: "1px solid var(--accent-purple)" }}>
              <div className="flex-between mb-4">
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                    Applicants for: {selectedJobProposals.title}
                  </h3>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {selectedJobProposals.proposals?.length || 0} candidate(s) submitted proposals
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedJobProposals(null)}>
                  Close
                </button>
              </div>

              {(!selectedJobProposals.proposals || selectedJobProposals.proposals.length === 0) ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                  No proposals submitted yet for this job.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {selectedJobProposals.proposals.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 16,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                            {p.freelancerName || `Freelancer (${p.freelancerPubkey.slice(0, 6)}...${p.freelancerPubkey.slice(-4)})`}
                          </span>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>
                            {p.freelancerPubkey.slice(0, 6)}...{p.freelancerPubkey.slice(-4)}
                          </span>
                          <span className="badge badge-active" style={{ fontSize: 11 }}>
                            Bid: {p.bidAmount} USDC
                          </span>
                          {p.timeline && (
                            <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                              <Clock size={12} /> {p.timeline}
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 8 }}>
                          {p.coverNote}
                        </p>

                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
                          {p.resumeUrl && (
                            <a
                              href={p.resumeUrl.startsWith("http") ? p.resumeUrl : `https://${p.resumeUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--accent-purple)", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              📄 View Resume / Portfolio
                            </a>
                          )}
                          {p.experience && (
                            <span style={{ color: "var(--text-muted)" }}>
                              <strong>Note:</strong> {p.experience}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {selectedJobProposals.status === "open" ? (
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={hiring}
                            onClick={() => handleHireCandidate(selectedJobProposals.projectId, p.freelancerPubkey)}
                          >
                            Hire Candidate
                          </button>
                        ) : selectedJobProposals.freelancerPubkey === p.freelancerPubkey ? (
                          <span className="badge badge-completed">Hired</span>
                        ) : null}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate("/chat")}
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Jobs table */}
          <div className="card">
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <div className="spinner" />
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No Jobs Posted Yet</div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                  Post your first job to find top Web3 freelancers and start escrow contracts.
                </p>
                <button className="btn btn-primary" onClick={() => navigate("/client/post-job")}>
                  Post a Job Now
                </button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>JOB TITLE</th>
                      <th>BUDGET</th>
                      <th>APPLICATIONS</th>
                      <th>STATUS</th>
                      <th>POSTED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.projectId || job._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                            {job.title}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            #{job.projectId?.slice(0, 16)}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: "var(--accent-green)" }}>
                            {job.budget} USDC
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "4px 8px", fontSize: 12 }}
                            onClick={() => setSelectedJobProposals(job)}
                          >
                            <Users size={13} style={{ marginRight: 4 }} />
                            <strong>{job.proposals?.length || 0}</strong> applicants
                          </button>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_COLOR[job.status] || "badge-pending"}`}>
                            {job.status === "open" ? "Open" : job.status === "in_progress" ? "In Progress" : job.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recent"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setSelectedJobProposals(job)}
                            >
                              <Eye size={12} /> View Bids
                            </button>
                            {job.status === "open" && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setSelectedJobProposals(job)}
                              >
                                Review & Hire <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
