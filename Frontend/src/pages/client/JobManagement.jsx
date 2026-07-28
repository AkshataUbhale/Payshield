import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, CheckCircle, AlertTriangle } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import EscrowStatus from "../../components/contracts/EscrowStatus";

const CLIENT_JOBS = [
  { id: "J001", title: "React Dashboard Build", budget: 500, applications: 8, status: "Active",
    topApplicant: "Alex Johnson", posted: "2026-03-10" },
  { id: "J002", title: "Solidity Token Contract", budget: 1200, applications: 3, status: "Hired",
    topApplicant: "Priya Sharma", posted: "2026-03-05" },
  { id: "J003", title: "SaaS UI Mockups", budget: 350, applications: 12, status: "Active",
    topApplicant: "Carlos Rivera", posted: "2026-03-08" },
  { id: "J004", title: "Python ML Pipeline", budget: 800, applications: 5, status: "Completed",
    topApplicant: "Yuki Tanaka", posted: "2026-02-20" },
];

const STATUS_COLOR = { Active: "badge-active", Hired: "badge-submitted", Completed: "badge-completed" };

export default function JobManagement() {
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">My Jobs</span>
            <span className="topbar-breadcrumb">{CLIENT_JOBS.length} jobs posted</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/post-job")}>+ Post Job</button>
          </div>
        </div>

        <div className="page-container">
          {/* Summary */}
          <div className="grid-4 mb-8">
            {[
              { label: "Total Posted", value: CLIENT_JOBS.length, color: "purple" },
              { label: "Active", value: CLIENT_JOBS.filter(j => j.status === "Active").length, color: "green" },
              { label: "Hired", value: CLIENT_JOBS.filter(j => j.status === "Hired").length, color: "blue" },
              { label: "Completed", value: CLIENT_JOBS.filter(j => j.status === "Completed").length, color: "amber" },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Jobs table */}
          <div className="card">
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
                  {CLIENT_JOBS.map(job => (
                    <tr key={job.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{job.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>#{job.id}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--accent-green)" }}>{job.budget} USDC</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{job.applications}</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>applicants</span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Top: {job.topApplicant}</div>
                      </td>
                      <td><span className={`badge ${STATUS_COLOR[job.status] || "badge-pending"}`}>{job.status}</span></td>
                      <td style={{ fontSize: 12 }}>{job.posted}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/freelancer/job/${job.id}`)}>
                            <Eye size={12} /> View
                          </button>
                          {job.status === "Active" && (
                            <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/freelancers")}>
                              Hire <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
