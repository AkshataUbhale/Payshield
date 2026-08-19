import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, FileText, TrendingUp, Briefcase,
  ArrowRight, Search, Star, ChevronRight
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import StatCard from "../../components/dashboard/StatCard";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import EarningsChart from "../../components/dashboard/EarningsChart";
import JobCard from "../../components/jobs/JobCard";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { getContracts } from "../../services/api";

const DEMO_ACTIVITY = [];

const CHART_DATA = [
  { month: "Oct", amount: 0 },
  { month: "Nov", amount: 0 },
  { month: "Dec", amount: 0 },
  { month: "Jan", amount: 0 },
  { month: "Feb", amount: 0 },
  { month: "Mar", amount: 0 },
];

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shortAddress } = useWallet();
  const [activeCount, setActiveCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("ps_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getContracts({ status: "in_progress" }, token)
      .then(data => {
        const list = data.projects ?? data;
        setActiveCount(Array.isArray(list) ? list.length : 0);
      })
      .catch(err => console.error("Failed to load active contracts:", err));

    getContracts({ status: "open" }, token)
      .then(data => {
        const list = data.projects ?? data;
        if (Array.isArray(list)) {
          setRecommendedJobs(list.slice(0, 3));
        }
      })
      .catch(err => console.error("Failed to load open jobs:", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Wallet",           value: shortAddress || "Not connected",               icon: Wallet,     color: "purple", change: "Solana Devnet",  up: true  },
    { label: "Active Contracts", value: activeCount.toString(),                         icon: FileText,   color: "blue",   change: "Real-time count",  up: true  },
    { label: "Total Earned",     value: "$0.00",                   icon: TrendingUp,  color: "green",  change: "Real-time earnings",   up: true  },
    { label: "Jobs Applied",     value: "0",                        icon: Briefcase,  color: "amber",  change: "0 pending",     up: true  },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Freelancer Dashboard</span>
            <span className="topbar-breadcrumb">Welcome back, {user?.name?.split(" ")[0] || "Alex"}! 👋</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <div className="wallet-badge" id="wallet-badge-topbar" onClick={() => navigate("/wallet")}>
              <div className="wallet-dot" />
              {shortAddress || "Connect Wallet"}
            </div>
            <button id="btn-browse-jobs" className="btn btn-primary btn-sm" onClick={() => navigate("/freelancer/jobs")}>
              <Search size={14} /> Browse Jobs
            </button>
          </div>
        </div>

        <div className="page-container">
          {/* Stats */}
          <div className="grid-4 mb-8">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid-2 mb-6">
            {/* Earnings Chart */}
            <div className="card">
              <div className="flex-between mb-6">
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Earnings Overview</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Last 6 months</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/freelancer/payments")}>
                  View All <ArrowRight size={13} />
                </button>
              </div>
              <EarningsChart data={CHART_DATA} />
              <div className="flex-between mt-6" style={{ marginTop: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>This Month</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-green)" }}>$1,800</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Total Lifetime</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>$7,380</div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Activity Feed</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)",
                    animation: "pulse 2s infinite", boxShadow: "0 0 6px rgba(16,185,129,0.6)" }} />
                  <span style={{ fontSize: 12, color: "var(--accent-green)", fontWeight: 600 }}>Live</span>
                </div>
              </div>
              <ActivityFeed items={DEMO_ACTIVITY} />
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="card">
            <div className="flex-between mb-6">
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recommended Jobs</h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Matched to your skills</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/freelancer/jobs")}>
                View All <ArrowRight size={13} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                  <div className="spinner" />
                </div>
              ) : recommendedJobs.length > 0 ? (
                recommendedJobs.map(job => (
                  <JobCard key={job.projectId} job={{
                    ...job,
                    id: job.projectId,
                    skills: job.skills || ["Solana", "Web3"],
                    clientName: "Client " + (job.clientPubkey ? `${job.clientPubkey.slice(0, 6)}...${job.clientPubkey.slice(-4)}` : "Unknown")
                  }} onClick={() => navigate(`/freelancer/job/${job.projectId}`)} />
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-secondary)", fontSize: 13 }}>
                  No open jobs available on PayShield yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="card mt-6" style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "Browse Jobs",      to: "/freelancer/jobs",     color: "btn-primary" },
                { label: "My Contracts",     to: "/freelancer/contracts", color: "btn-secondary" },
                { label: "Submit Work",      to: "/submit",              color: "btn-ghost" },
                { label: "View Payments",    to: "/freelancer/payments", color: "btn-success" },
                { label: "Dispute Center",   to: "/dispute",             color: "btn-danger" },
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
