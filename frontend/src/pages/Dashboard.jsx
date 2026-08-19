import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Wallet, FileText, TrendingUp, AlertTriangle,
  Plus, ArrowRight, Clock, CheckCircle, Activity
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";
import { getContracts, getDisputes } from "../services/api";

const statusDot = {
  Active: "var(--accent-green)",
  Submitted: "var(--accent-blue)",
  Pending: "var(--accent-amber)",
  Completed: "var(--accent-green)",
  Disputed: "var(--accent-red)",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { publicKey, shortAddress } = useWallet();
  const [contracts, setContracts] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("ps_token");
    if (!token) { setLoading(false); return; }

    Promise.all([
      getContracts({}, token).catch(() => []),
      getDisputes(token).catch(() => []),
    ]).then(([contractData, disputeData]) => {
      const contractList = Array.isArray(contractData) ? contractData : contractData.projects || [];
      const disputeList = Array.isArray(disputeData) ? disputeData : [];
      setContracts(contractList);
      setDisputes(disputeList);
    }).finally(() => setLoading(false));
  }, [publicKey]);

  const activeContracts = contracts.filter(c => c.status === "in_progress");
  const totalEarned = contracts.filter(c => c.status === "completed").reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const openDisputes = disputes.filter(d => d.status !== "resolved").length;

  const stats = [
    { label: "Wallet", value: shortAddress || "Not connected", icon: Wallet, color: "purple", change: "Solana Devnet", up: true },
    { label: "Active Contracts", value: activeContracts.length.toString(), icon: FileText, color: "blue", change: "In progress", up: true },
    { label: "Total Earned", value: `${totalEarned} USDC`, icon: TrendingUp, color: "green", change: "Completed payouts", up: true },
    { label: "Open Disputes", value: openDisputes.toString(), icon: AlertTriangle, color: "amber", change: openDisputes > 0 ? "Requires action" : "No disputes", up: openDisputes === 0 },
  ];

  // Build activity feed from real contract + dispute events
  const activityFeed = [
    ...contracts.filter(c => c.status === "completed").map(c => ({
      id: `payment-${c.projectId || c._id}`,
      type: "Payment Released",
      desc: `${c.title} — ${c.budget} USDC`,
      time: new Date(c.updatedAt || c.createdAt).toLocaleDateString(),
      color: "green",
      icon: CheckCircle,
    })),
    ...contracts.filter(c => c.status === "in_progress").map(c => ({
      id: `contract-${c.projectId || c._id}`,
      type: "Contract Active",
      desc: c.title,
      time: new Date(c.createdAt).toLocaleDateString(),
      color: "purple",
      icon: FileText,
    })),
    ...disputes.map(d => ({
      id: `dispute-${d._id || d.id}`,
      type: "Dispute Raised",
      desc: d.contractTitle || `Dispute #${(d._id || d.id)?.slice(0, 8)}`,
      time: new Date(d.createdAt).toLocaleDateString(),
      color: "amber",
      icon: AlertTriangle,
    })),
  ].slice(0, 4);

  // Quick contracts list (most recent 3)
  const quickContracts = contracts.slice(0, 3).map(c => ({
    id: c.projectId || c._id,
    title: c.title,
    freelancer: c.freelancerPubkey
      ? `${c.freelancerPubkey.slice(0, 6)}...${c.freelancerPubkey.slice(-4)}`
      : "Unassigned",
    amount: c.budget,
    status: c.status === "open" ? "Pending" : c.status === "in_progress" ? "Active" : c.status === "completed" ? "Completed" : c.status,
    progress: c.status === "completed" ? 100 : c.status === "in_progress" ? 50 : 0,
  }));

  return (
    <div className="app-layout">
      <Sidebar walletAddress={shortAddress} />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Dashboard</span>
            <span className="topbar-breadcrumb">Welcome back, {user?.name?.split(" ")[0] || user?.username || "User"}! 👋</span>
          </div>
          <div className="topbar-right">
            <div className="wallet-badge" id="wallet-badge-topbar" onClick={() => navigate("/wallet")}>
              <div className="wallet-dot" />
              {shortAddress || "Connect Wallet"}
            </div>
            <button
              id="btn-create-contract"
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/create")}
            >
              <Plus size={14}/> New Contract
            </button>
          </div>
        </div>

        <div className="page-container">
          {/* Stats Grid */}
          <div className="grid-4 mb-8">
            {stats.map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-change ${s.up ? "up" : "down"}`}>
                  {s.up ? "▲" : "▼"} {s.change}
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            {/* Quick Contracts */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Contracts</h2>
                <button
                  id="btn-view-all-contracts"
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate("/contracts")}
                >
                  View All <ArrowRight size={13}/>
                </button>
              </div>

              {loading ? (
                <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
                  Loading...
                </div>
              ) : quickContracts.length === 0 ? (
                <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem", fontSize: 13 }}>
                  No contracts yet. Create your first escrow contract to get started.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {quickContracts.map(c => (
                    <div
                      key={c.id}
                      style={{ padding: "14px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                      onClick={() => navigate(`/contract/${c.id}`)}
                    >
                      <div className="flex-between" style={{ marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{c.title}</div>
                          <div style={{ fontSize: 12, fontFamily: "'Courier New',monospace", color: "var(--text-muted)" }}>
                            {c.freelancer}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-green)", marginBottom: 4 }}>
                            {c.amount} USDC
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusDot[c.status] || "var(--text-muted)" }} />
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${c.status === "Active" ? "purple" : c.status === "Completed" ? "green" : "amber"}`}
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Feed */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Activity Feed</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)",
                    animation: "pulse 2s infinite", boxShadow: "0 0 6px rgba(16,185,129,0.6)"
                  }} />
                  <span style={{ fontSize: 12, color: "var(--accent-green)", fontWeight: 600 }}>Live</span>
                </div>
              </div>

              {loading ? (
                <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
                  Loading...
                </div>
              ) : activityFeed.length === 0 ? (
                <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem", fontSize: 13 }}>
                  No activity yet. Create or complete a contract to see events here.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {activityFeed.map((a) => (
                    <div key={a.id} className="milestone-item" style={{ padding: "16px 0" }}>
                      <div className={`stat-icon ${a.color}`} style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }}>
                        <a.icon size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{a.type}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.desc}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                        <Clock size={10} style={{ display: "inline", marginRight: 3 }} />
                        {a.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-6">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Quick Actions</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "Create Contract", to: "/create",    color: "btn-primary",   icon: Plus },
                { label: "View Contracts",  to: "/contracts", color: "btn-secondary",  icon: FileText },
                { label: "Submit Work",     to: "/submit",    color: "btn-ghost",      icon: Activity },
                { label: "Approve Payment", to: "/approve",   color: "btn-success",    icon: CheckCircle },
                { label: "Dispute Center",  to: "/dispute",   color: "btn-danger",     icon: AlertTriangle },
              ].map(a => (
                <button
                  key={a.label}
                  id={`btn-quick-${a.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`btn ${a.color}`}
                  onClick={() => navigate(a.to)}
                >
                  <a.icon size={15}/> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
