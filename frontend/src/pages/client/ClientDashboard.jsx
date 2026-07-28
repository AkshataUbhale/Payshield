import { useState } from "react";
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

const DEMO_FREELANCERS = [
  { id: "f1", name: "Alex Johnson",    skills: ["React","Node.js","TypeScript"], rating: 4.9, hourlyRate: 45, completedJobs: 34,
    bio: "Full-stack developer specializing in React and blockchain integrations.", location: "USA" },
  { id: "f2", name: "Priya Sharma",    skills: ["Solidity","Web3","Ethereum"],    rating: 4.7, hourlyRate: 60, completedJobs: 22,
    bio: "Smart contract developer with 3 years of DeFi and NFT experience.", location: "India" },
  { id: "f3", name: "Carlos Rivera",   skills: ["Figma","UI/UX","Prototyping"],   rating: 4.8, hourlyRate: 35, completedJobs: 51,
    bio: "UI/UX designer crafting delightful, conversion-focused digital experiences.", location: "Spain" },
];

const DEMO_ACTIVITY = [
  { type: "Freelancer Hired",  desc: "Alex Johnson for React Dashboard",  time: "2h ago" },
  { type: "Escrow Locked",     desc: "Logo Design — 200 USDC locked",     time: "4h ago" },
  { type: "Payment Released",  desc: "Web App Frontend — 450 USDC sent",  time: "1d ago" },
  { type: "Dispute Raised",    desc: "SEO Audit Project #C008",           time: "2d ago" },
];

const ESCROW_CONTRACTS = [
  { id: "C001", freelancer: "Alex Johnson",  amount: 500,  status: "Active" },
  { id: "C002", freelancer: "Priya Sharma",  amount: 1200, status: "Escrow Locked" },
  { id: "C003", freelancer: "Carlos Rivera", amount: 200,  status: "Submitted" },
];

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shortAddr, balance } = useWallet();
  const [wallet] = useState("0xB2C3D4E5F6789012BCDEF1234567890ABCDEF1234");

  const stats = [
    { label: "Total Spent",        value: "$12,400",  icon: DollarSign,  color: "purple", change: "+$2.1K this month", up: true  },
    { label: "Active Contracts",   value: "5",        icon: FileText,    color: "blue",   change: "+2 this week",     up: true  },
    { label: "Freelancers Hired",  value: "18",       icon: Users,       color: "green",  change: "+3 this month",    up: true  },
    { label: "Jobs Posted",        value: "24",       icon: TrendingUp,  color: "amber",  change: "6 active",         up: true  },
  ];

  return (
    <div className="app-layout">
      <Sidebar walletAddress={wallet} />
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
              {shortAddr || `${wallet.slice(0,6)}...${wallet.slice(-4)}`}
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
                {DEMO_FREELANCERS.map(f => (
                  <FreelancerCard key={f.id} freelancer={f}
                    onClick={() => navigate(`/client/hire/${f.id}`)} />
                ))}
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
                  {ESCROW_CONTRACTS.map(c => (
                    <div key={c.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 0", borderBottom: "1px solid var(--border)"
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.freelancer}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Contract #{c.id}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-green)" }}>{c.amount} USDC</div>
                        <EscrowStatus status={c.status} />
                      </div>
                    </div>
                  ))}
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
