import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign, FileText, Users, TrendingUp,
  ArrowRight, PlusCircle
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import StatCard from "../../components/dashboard/StatCard";
import FreelancerCard from "../../components/freelancers/FreelancerCard";
import EscrowStatus from "../../components/contracts/EscrowStatus";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { getContracts, getFreelancers } from "../../services/api";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shortAddress, publicKey } = useWallet();
  const [contracts, setContracts] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("ps_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getContracts({}, token)
      .then((data) => {
        const list = Array.isArray(data) ? data : data.projects || data.contracts || [];
        setContracts(list);
      })
      .catch((err) => console.error("Failed to load client projects:", err));

    getFreelancers(token)
      .then((data) => {
        const list = Array.isArray(data) ? data : data.freelancers || [];
        setFreelancers(list.slice(0, 3));
      })
      .catch((err) => console.error("Failed to load freelancers:", err))
      .finally(() => setLoading(false));
  }, [publicKey]);

  const activeContracts = contracts.filter((c) => c.status === "in_progress");
  const totalSpent = contracts.reduce((acc, c) => acc + (c.budget || 0), 0);
  const uniqueFreelancers = new Set(contracts.map((c) => c.freelancerPubkey).filter(Boolean)).size;

  const stats = [
    { label: "Total Committed", value: `${totalSpent} USDC`, icon: DollarSign, color: "purple", change: "On-chain escrow value", up: true },
    { label: "Active Contracts", value: activeContracts.length.toString(), icon: FileText, color: "blue", change: "In progress projects", up: true },
    { label: "Freelancers Hired", value: uniqueFreelancers.toString(), icon: Users, color: "green", change: "Unique freelancers hired", up: true },
    { label: "Jobs Posted", value: contracts.length.toString(), icon: TrendingUp, color: "amber", change: "Total posted escrows", up: true },
  ];

  return (
    <div className="app-layout">
      <Sidebar walletAddress={user?.walletAddress || shortAddress} />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Client Dashboard</span>
            <span className="topbar-breadcrumb">Welcome back, {user?.name?.split(" ")[0] || user?.username || "Client"}! 👋</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <div className="wallet-badge" onClick={() => navigate("/wallet")}>
              <div className="wallet-dot" />
              {shortAddress || "Connect Wallet"}
            </div>
            <button id="btn-post-job" className="btn btn-primary btn-sm" onClick={() => navigate("/client/post-job")}>
              <PlusCircle size={14} /> Post a Job
            </button>
          </div>
        </div>

        <div className="page-container">
          {/* Stats */}
          <div className="grid-4 mb-8">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid-2 mb-6">
            {/* Recommended Freelancers */}
            <div className="card">
              <div className="flex-between mb-6">
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Top Available Developers</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Verified Solana talent</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/client/freelancers")}>
                  View All <ArrowRight size={13} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {loading ? (
                  <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
                    Loading developers...
                  </div>
                ) : freelancers.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
                    No registered freelancers yet.
                  </div>
                ) : (
                  freelancers.map((f) => (
                    <FreelancerCard
                      key={f.publicKey || f._id}
                      freelancer={{
                        id: f.publicKey || f._id,
                        name: f.name || f.username || `Dev (${f.publicKey?.slice(0, 6)}...${f.publicKey?.slice(-4)})`,
                        skills: f.skills && f.skills.length > 0 ? f.skills : ["Solana", "Web3"],
                        rating: 5.0,
                        hourlyRate: f.hourlyRate || 50,
                        completedJobs: f.completedProjects || 0,
                        bio: f.bio || "Full-stack Web3 developer ready for milestone contracts.",
                        location: f.location || "Remote",
                      }}
                      onClick={() => navigate(`/client/hire/${f.publicKey || f._id}`)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Active Escrow Contracts */}
            <div className="card">
              <div className="flex-between mb-6">
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>My Escrow Contracts</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>On-chain project statuses</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/contracts")}>
                  All Escrows <ArrowRight size={13} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {loading ? (
                  <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
                    Loading projects...
                  </div>
                ) : contracts.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
                    No jobs posted yet. Post a job to deposit into a Solana escrow contract.
                  </div>
                ) : (
                  contracts.slice(0, 4).map((c) => (
                    <div
                      key={c.projectId || c._id}
                      className="contract-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/contract/${c.projectId || c._id}`)}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          Budget: <strong style={{ color: "var(--accent-green)" }}>{c.budget} USDC</strong> · Status: {c.status}
                        </div>
                      </div>
                      <EscrowStatus status={c.status === "in_progress" ? "Active" : c.status === "completed" ? "Completed" : "Pending"} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
