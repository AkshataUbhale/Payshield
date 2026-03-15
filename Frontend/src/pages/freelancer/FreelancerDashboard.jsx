import { useState } from "react";
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

const DEMO_JOBS = [
  { id: 1, title: "React Developer Needed", budget: 500, skills: ["React", "Node.js", "TypeScript"],
    deadline: "2026-03-25", status: "Open", clientName: "TechCorp Inc.", description: "Build a dashboard UI with React and Node backend. Responsive design required." },
  { id: 2, title: "Solidity Smart Contract Dev", budget: 1200, skills: ["Solidity", "Ethereum", "Web3"],
    deadline: "2026-04-01", status: "Open", clientName: "DeFi Labs", description: "Develop ERC-20 token contract with staking functionality." },
  { id: 3, title: "UI/UX Designer for SaaS App", budget: 350, skills: ["Figma", "UI/UX", "Prototyping"],
    deadline: "2026-03-20", status: "Open", clientName: "StartupHQ", description: "Design user flows and hi-fi mockups for a B2B SaaS dashboard." },
];

const DEMO_ACTIVITY = [
  { type: "Job Applied",       desc: "React Developer at TechCorp",          time: "1h ago" },
  { type: "Payment Released",  desc: "Web App Frontend — 450 USDC",          time: "5h ago" },
  { type: "Work Submitted",    desc: "Mobile App UI Design via IPFS",         time: "1d ago" },
  { type: "Contract Created",  desc: "Solidity Audit — DeFi Labs",           time: "2d ago" },
];

const CHART_DATA = [
  { month: "Oct", amount: 800 },
  { month: "Nov", amount: 1200 },
  { month: "Dec", amount: 950 },
  { month: "Jan", amount: 1600 },
  { month: "Feb", amount: 1100 },
  { month: "Mar", amount: 1800 },
];

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shortAddr, balance } = useWallet();
  const [wallet] = useState("0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12");

  const stats = [
    { label: "Wallet Balance",   value: `${balance || "420"} USDC`, icon: Wallet,     color: "purple", change: "+12%",          up: true  },
    { label: "Active Contracts", value: "3",                         icon: FileText,   color: "blue",   change: "+1 this week",  up: true  },
    { label: "Total Earned",     value: "$7,380",                   icon: TrendingUp,  color: "green",  change: "+$820/month",   up: true  },
    { label: "Jobs Applied",     value: "12",                        icon: Briefcase,  color: "amber",  change: "4 pending",     up: true  },
  ];

  return (
    <div className="app-layout">
      <Sidebar walletAddress={wallet} />
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
              {shortAddr || `${wallet.slice(0,6)}...${wallet.slice(-4)}`}
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
              {DEMO_JOBS.map(job => (
                <JobCard key={job.id} job={job} onClick={() => navigate(`/freelancer/job/${job.id}`)} />
              ))}
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
