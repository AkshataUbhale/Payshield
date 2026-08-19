import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign, FileText, Users, TrendingUp,
  ArrowRight, PlusCircle, ChevronRight
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import StatCard from "../../components/dashboard/StatCard";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import FreelancerCard from "../../components/freelancers/FreelancerCard";
import EscrowStatus from "../../components/contracts/EscrowStatus";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { getContracts, getFreelancers } from "../../services/api";

const DEMO_ACTIVITY = [];

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shortAddress } = useWallet();
  const [contracts, setContracts] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("ps_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getContracts({ clientPubkey: user?.walletAddress }, token)
      .then(data => {
        setContracts(data.projects ?? data ?? []);
      })
      .catch(err => console.error("Failed to load client projects:", err));

    getFreelancers(token)
      .then(data => {
        setFreelancers(data ?? []);
      })
      .catch(err => console.error("Failed to load freelancers:", err))
      .finally(() => setLoading(false));
  }, [user?.walletAddress]);

  const activeContracts = contracts.filter(c => c.status === "in_progress");
  const totalSpent = contracts.reduce((acc, c) => acc + (c.budget || 0), 0);
  const uniqueFreelancers = new Set(contracts.map(c => c.freelancerPubkey).filter(Boolean)).size;

  const stats = [
    { label: "Total Committed",    value: `${totalSpent} USDC`,  icon: DollarSign,  color: "purple", change: "On-chain escrow value", up: true  },
    { label: "Active Contracts",   value: activeContracts.length.toString(),  icon: FileText,    color: "blue",   change: "In progress projects",     up: true  },
    { label: "Freelancers Hired",  value: uniqueFreelancers.toString(),       icon: Users,       color: "green",  change: "Unique freelancers hired",    up: true  },
    { label: "Jobs Posted",        value: contracts.length.toString(),       icon: TrendingUp,  color: "amber",  change: "Total posted escrows",         up: true  },
  ];

  return (
    <div className="app-layout">
      <Sidebar walletAddress={user?.walletAddress || shortAddress} />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Client Dashboard</span>
            <span className="topbar-breadcrumb">Welcome back, {user?.name?.split(" ")[0] || "Sarah"}! 👋</span>
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
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid-2 mb-6">
            {/* Recommended Freelancers */}
            <div className="card">
              <div className="flex-between mb-6">
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recommended Freelancers</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Top talent for your projects</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/client/freelancers")}>
                  View All <ArrowRight size={13} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                    <div className="spinner" />
                  </div>
                ) : freelancers.length > 0 ? (
                  freelancers.slice(0, 3).map(f => (
                    <FreelancerCard key={f.publicKey} freelancer={{
                      id: f.publicKey,
                      name: f.username || "Freelancer",
                      skills: f.skills || ["Solana", "Web3"],
                      rating: 5.0,
                      hourlyRate: f.hourlyRate || 40,
                      completedJobs: 1,
                      bio: f.bio || "Solana Web3 developer ready to build.",
                      location: "Remote"
                    }}
                      onClick={() => navigate(`/client/hire/${f.publicKey}`)} />
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-secondary)", fontSize: 13 }}>
                    No registered freelancers found.
                  </div>
                )}
              </div>
            </div>

            {/* Activity + Escrow */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Escrow Activity */}
              <div className="card">
                <div className="flex-between mb-4">
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Escrow Contracts</h2>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate("/contracts")}>
                    View All <ArrowRight size={13} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                      <div className="spinner" />
                    </div>
                  ) : contracts.length > 0 ? (
                    contracts.slice(0, 3).map(c => (
                      <div key={c.projectId} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 0", borderBottom: "1px solid var(--border)"
                      }} onClick={() => navigate(`/contract/${c.projectId}`)}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {c.freelancerPubkey ? `Freelancer: ${c.freelancerPubkey.slice(0,6)}...${c.freelancerPubkey.slice(-4)}` : "Unassigned"}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-green)" }}>{c.budget} USDC</div>
                          <EscrowStatus status={c.status} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-secondary)", fontSize: 13 }}>
                      No active escrow contracts yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="card" style={{ flex: 1 }}>
                <div className="flex-between mb-4">
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Activity</h2>
                </div>
                <ActivityFeed items={DEMO_ACTIVITY} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "Post a Job",         to: "/client/post-job",     color: "btn-primary" },
                { label: "My Jobs",            to: "/client/jobs",         color: "btn-secondary" },
                { label: "Find Freelancers",   to: "/client/freelancers",  color: "btn-ghost" },
                { label: "Create Escrow",      to: "/create",              color: "btn-success" },
                { label: "Approve Work",       to: "/approve",             color: "btn-ghost" },
                { label: "Dispute Center",     to: "/dispute",             color: "btn-danger" },
              ].map(a => (
                <button key={a.label} className={`btn ${a.color}`} onClick={() => navigate(a.to)}>
                  {a.label} <ChevronRight size={13} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
