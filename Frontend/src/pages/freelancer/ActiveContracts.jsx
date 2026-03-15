import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import EscrowStatus from "../../components/contracts/EscrowStatus";
import { statusBadgeClass } from "../../utils/helpers";

const MY_CONTRACTS = [
  { id: "C001", title: "React Dashboard Build", client: "TechCorp Inc.", amount: 500,
    status: "Active", progress: 60, deadline: "2026-03-25", milestones: 3, done: 1 },
  { id: "C002", title: "Solidity Token Contract", client: "DeFi Labs", amount: 1200,
    status: "Submitted", progress: 100, deadline: "2026-04-01", milestones: 2, done: 2 },
  { id: "C003", title: "SaaS UI Mockups", client: "StartupHQ", amount: 350,
    status: "Pending", progress: 0, deadline: "2026-03-20", milestones: 2, done: 0 },
  { id: "C004", title: "Python ML Pipeline", client: "AI Research Ltd.", amount: 800,
    status: "Disputed", progress: 75, deadline: "2026-04-10", milestones: 4, done: 3 },
];

const STATUS_ICONS = {
  Active: { icon: Clock, color: "var(--accent-green)" },
  Submitted: { icon: CheckCircle, color: "var(--accent-blue)" },
  Pending: { icon: Clock, color: "var(--accent-amber)" },
  Disputed: { icon: AlertTriangle, color: "var(--accent-red)" },
  Completed: { icon: CheckCircle, color: "var(--accent-purple)" },
};

export default function ActiveContracts() {
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">My Contracts</span>
            <span className="topbar-breadcrumb">{MY_CONTRACTS.length} contracts</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div className="page-container">
          {/* Summary cards */}
          <div className="grid-4 mb-8">
            {[
              { label: "Total Active", value: MY_CONTRACTS.filter(c => c.status === "Active").length, color: "green" },
              { label: "Pending Review", value: MY_CONTRACTS.filter(c => c.status === "Submitted").length, color: "blue" },
              { label: "In Dispute", value: MY_CONTRACTS.filter(c => c.status === "Disputed").length, color: "amber" },
              { label: "Total Earned", value: "7,380 USDC", color: "purple" },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Contract list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MY_CONTRACTS.map(c => {
              const cfg = STATUS_ICONS[c.status] || STATUS_ICONS.Active;
              const Icon = cfg.icon;
              return (
                <div key={c.id} className={`contract-card ${c.status.toLowerCase()}`}
                  onClick={() => navigate(`/contract/${c.id}`)}>
                  <div className="flex-between" style={{ marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Client: <strong>{c.client}</strong> · Contract #{c.id}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <EscrowStatus status={c.status} />
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-green)" }}>
                        {c.amount} USDC
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: 12 }}>
                    <div className="flex-between" style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Milestones: {c.done}/{c.milestones} complete
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{c.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${c.status === "Disputed" ? "amber" : c.status === "Submitted" ? "green" : "purple"}`}
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex-between">
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Due: {c.deadline}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {c.status === "Active" && (
                        <button className="btn btn-primary btn-sm"
                          onClick={e => { e.stopPropagation(); navigate("/submit"); }}>
                          Submit Work
                        </button>
                      )}
                      {c.status === "Disputed" && (
                        <button className="btn btn-danger btn-sm"
                          onClick={e => { e.stopPropagation(); navigate("/dispute"); }}>
                          View Dispute
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); navigate(`/contract/${c.id}`); }}>
                        Details <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
