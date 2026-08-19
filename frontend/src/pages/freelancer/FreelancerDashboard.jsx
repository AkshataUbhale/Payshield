import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, FileText, TrendingUp, Briefcase,
  ArrowRight, Search
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import StatCard from "../../components/dashboard/StatCard";
import EarningsChart from "../../components/dashboard/EarningsChart";
import JobCard from "../../components/jobs/JobCard";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { getContracts } from "../../services/api";

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shortAddress, publicKey } = useWallet();
  const [activeCount, setActiveCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
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
        const inProgress = list.filter((c) => c.status === "in_progress" && (c.freelancerPubkey === publicKey || !c.freelancerPubkey));
        const completed = list.filter((c) => c.status === "completed" && c.freelancerPubkey === publicKey);
        const applied = list.filter((c) => (c.proposals || []).some((p) => p.freelancerPubkey === publicKey));

        setActiveCount(inProgress.length);
        setAppliedCount(applied.length);
        setTotalEarned(completed.reduce((sum, c) => sum + (Number(c.budget) || 0), 0));

        const openJobs = list.filter((c) => c.status === "open").slice(0, 3);
        setRecommendedJobs(openJobs);
      })
      .catch((err) => console.error("Failed to load contracts:", err))
      .finally(() => setLoading(false));
  }, [publicKey]);

  const stats = [
    { label: "Wallet", value: shortAddress || "Not connected", icon: Wallet, color: "purple", change: "Solana Devnet", up: true },
    { label: "Active Contracts", value: activeCount.toString(), icon: FileText, color: "blue", change: "Real-time count", up: true },
    { label: "Total Earned", value: `${totalEarned} USDC`, icon: TrendingUp, color: "green", change: "On-chain payouts", up: true },
    { label: "Jobs Applied", value: appliedCount.toString(), icon: Briefcase, color: "amber", change: `${appliedCount} proposals`, up: true },
  ];

  const chartData = [
    { month: "Current", amount: totalEarned },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Freelancer Dashboard</span>
            <span className="topbar-breadcrumb">Welcome back, {user?.name?.split(" ")[0] || user?.username || "Freelancer"}! 👋</span>
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
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid-2 mb-6">
            {/* Earnings Chart */}
            <div className="card">
              <div className="flex-between mb-6">
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Earnings Trend</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Real-time earnings</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/freelancer/payments")}>
                  Details <ArrowRight size={13} />
                </button>
              </div>
              <EarningsChart data={chartData} />
            </div>

            {/* Recommended Jobs */}
            <div className="card">
              <div className="flex-between mb-6">
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Latest Open Jobs</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Verified on-chain escrow projects</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/freelancer/jobs")}>
                  View All <ArrowRight size={13} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {loading ? (
                  <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
                    Loading jobs from blockchain...
                  </div>
                ) : recommendedJobs.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
                    No open jobs at the moment. Post or check back soon!
                  </div>
                ) : (
                  recommendedJobs.map((job) => (
                    <JobCard
                      key={job.projectId || job._id}
                      job={{
                        id: job.projectId || job._id,
                        title: job.title,
                        description: job.description,
                        budget: job.budget,
                        deadline: job.deadline,
                        skills: job.skills || [],
                        status: job.status,
                      }}
                      onClick={() => navigate(`/job/${job.projectId || job._id}`)}
                    />
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
