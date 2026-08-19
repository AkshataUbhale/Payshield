import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import EscrowStatus from "../../components/contracts/EscrowStatus";
import { useWallet } from "../../hooks/useWallet";
import { useAuth } from "../../hooks/useAuth";
import * as api from "../../services/api";

const STATUS_ICONS = {
  in_progress: { icon: Clock, color: "var(--accent-green)", label: "In Progress" },
  open: { icon: Clock, color: "var(--accent-blue)", label: "Open" },
  completed: { icon: CheckCircle, color: "var(--accent-purple)", label: "Completed" },
  disputed: { icon: AlertTriangle, color: "var(--accent-red)", label: "Disputed" },
  cancelled: { icon: AlertTriangle, color: "var(--accent-amber)", label: "Cancelled" },
};

export default function ActiveContracts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContracts() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        const myPubkey = user?.walletAddress || user?.id || (publicKey ? publicKey.toBase58() : null);
        if (!myPubkey && !token) {
          setContracts([]);
          return;
        }

        const res = await api.getContracts({ freelancerPubkey: myPubkey }, token);
        const list = Array.isArray(res) ? res : res.contracts || res.projects || [];
        const myContracts = list.filter(
          (c) =>
            c.freelancerPubkey === myPubkey ||
            c.freelancerPubkey === user?.walletAddress ||
            c.freelancerPubkey === user?.id
        );
        setContracts(myContracts);
      } catch (err) {
        console.error("Failed to load contracts:", err);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    }
    loadContracts();
  }, [publicKey, user?.walletAddress, user?.id]);

  const activeCount = contracts.filter((c) => c.status === "in_progress").length;
  const completedCount = contracts.filter((c) => c.status === "completed").length;
  const totalEarned = contracts
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + (Number(c.budget) || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">My Contracts</span>
            <span className="topbar-breadcrumb">{contracts.length} contracts</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div className="page-container">
          {/* Summary cards */}
          <div className="grid-4 mb-8">
            {[
              { label: "Active Jobs", value: activeCount, color: "green" },
              { label: "Completed", value: completedCount, color: "purple" },
              { label: "Total Contracts", value: contracts.length, color: "blue" },
              { label: "Total Earned", value: `${totalEarned} USDC`, color: "amber" },
            ].map((s) => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Contract list */}
          {loading ? (
            <div className="card text-center" style={{ color: "var(--text-muted)", padding: "2rem" }}>
              Loading contracts from blockchain & database...
            </div>
          ) : contracts.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <FileText size={40} style={{ margin: "0 auto 1rem", color: "var(--text-muted)" }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Active Contracts Yet</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
                Apply to open projects or accept job offers to start escrow-protected contracts.
              </p>
              <button className="btn btn-primary" onClick={() => navigate("/freelancer/jobs")}>
                Browse Open Jobs <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {contracts.map((c) => {
                const statusKey = c.status || "open";
                const cfg = STATUS_ICONS[statusKey] || STATUS_ICONS.in_progress;
                const Icon = cfg.icon;
                const displayId = c.projectId || c._id;
                const progress = c.status === "completed" ? 100 : c.status === "in_progress" ? 50 : 0;

                return (
                  <div
                    key={displayId}
                    className={`contract-card ${statusKey}`}
                    onClick={() => navigate(`/contract/${displayId}`)}
                  >
                    <div className="flex-between" style={{ marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          Client: <strong>{c.clientPubkey ? `${c.clientPubkey.slice(0, 6)}...${c.clientPubkey.slice(-4)}` : "Unknown"}</strong> · Project #{displayId}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <EscrowStatus status={cfg.label} />
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-green)" }}>
                          {c.budget} USDC
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: 12 }}>
                      <div className="flex-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          Status: {cfg.label}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${c.status === "completed" ? "purple" : "green"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex-between">
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {c.deadline ? `Due: ${new Date(c.deadline).toLocaleDateString()}` : "Ongoing"}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(c.status === "in_progress" ? `/submit` : `/contract/${displayId}`);
                        }}
                      >
                        {c.status === "in_progress" ? "Submit Work" : "View Details"} <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
