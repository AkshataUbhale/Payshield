import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Wallet, FileText, TrendingUp, AlertTriangle,
  Plus, ArrowRight, Clock, CheckCircle, Activity
} from "lucide-react";

const RECENT_ACTIVITY = [
  { id: 1, type: "Contract Created", desc: "Logo Design for TechStartup", time: "2h ago", color: "purple", icon: FileText },
  { id: 2, type: "Payment Released", desc: "Web App Frontend — $450 USDC", time: "5h ago", color: "green",  icon: CheckCircle },
  { id: 3, type: "Work Submitted", desc: "Mobile App UI Design", time: "1d ago", color: "blue",   icon: Activity },
  { id: 4, type: "Dispute Raised",  desc: "SEO Audit Project", time: "2d ago", color: "amber",  icon: AlertTriangle },
];

const QUICK_CONTRACTS = [
  { id: 1, title:"Logo Design", freelancer:"0x1a2b...c3d4", amount:200, status:"Active",    progress:60 },
  { id: 2, title:"Smart Contract Dev", freelancer:"0x5e6f...7a8b", amount:800, status:"Submitted", progress:100 },
  { id: 3, title:"Content Writing", freelancer:"0x9c0d...e1f2", amount:120, status:"Pending",   progress:0 },
];

const statusDot = { Active:"var(--accent-green)", Submitted:"var(--accent-blue)", Pending:"var(--accent-amber)" };

export default function Dashboard() {
  const navigate = useNavigate();
  const [wallet] = useState("0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12");

  const stats = [
    { label:"Wallet Balance",    value:"1,240 USDC", icon:Wallet,       color:"purple", change:"+12.4%", up:true  },
    { label:"Active Contracts",  value:"3",          icon:FileText,      color:"blue",   change:"+1 this week", up:true  },
    { label:"Total Earned",      value:"$4,820",     icon:TrendingUp,    color:"green",  change:"+$820 this month", up:true  },
    { label:"Open Disputes",     value:"1",          icon:AlertTriangle, color:"amber",  change:"Requires action", up:false },
  ];

  return (
    <div className="app-layout">
      <Sidebar walletAddress={wallet} />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Dashboard</span>
            <span className="topbar-breadcrumb">Welcome back! Here's your overview.</span>
          </div>
          <div className="topbar-right">
            <div className="wallet-badge" id="wallet-badge-topbar">
              <div className="wallet-dot" />
              {`${wallet.slice(0,6)}...${wallet.slice(-4)}`}
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
                <h2 style={{ fontSize:16, fontWeight:700 }}>Recent Contracts</h2>
                <button
                  id="btn-view-all-contracts"
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate("/contracts")}
                >
                  View All <ArrowRight size={13}/>
                </button>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                {QUICK_CONTRACTS.map(c => (
                  <div
                    key={c.id}
                    style={{
                      padding:"14px 0",
                      borderBottom:"1px solid var(--border)",
                      cursor:"pointer"
                    }}
                    onClick={() => navigate("/contracts")}
                  >
                    <div className="flex-between" style={{ marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{c.title}</div>
                        <div style={{ fontSize:12, fontFamily:"'Courier New',monospace", color:"var(--text-muted)" }}>{c.freelancer}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:15, fontWeight:700, color:"var(--accent-green)", marginBottom:4 }}>
                          {c.amount} USDC
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:statusDot[c.status] }} />
                          <span style={{ fontSize:11, color:"var(--text-muted)" }}>{c.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${c.status === "Active" ? "purple" : c.status === "Submitted" ? "green" : "amber"}`}
                        style={{ width:`${c.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize:16, fontWeight:700 }}>Activity Feed</h2>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent-green)",
                    animation:"pulse 2s infinite", boxShadow:"0 0 6px rgba(16,185,129,0.6)" }} />
                  <span style={{ fontSize:12, color:"var(--accent-green)", fontWeight:600 }}>Live</span>
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {RECENT_ACTIVITY.map((a, i) => (
                  <div
                    key={a.id}
                    className="milestone-item"
                    style={{ padding:"16px 0" }}
                  >
                    <div className={`stat-icon ${a.color}`} style={{ width:36, height:36, borderRadius:10, flexShrink:0 }}>
                      <a.icon size={16} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{a.type}</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)" }}>{a.desc}</div>
                    </div>
                    <div style={{ fontSize:11, color:"var(--text-muted)", flexShrink:0 }}>
                      <Clock size={10} style={{ display:"inline", marginRight:3 }} />
                      {a.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-6">
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Quick Actions</h2>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {[
                { label:"Create Contract", to:"/create",    color:"btn-primary",   icon:Plus },
                { label:"View Contracts",  to:"/contracts", color:"btn-secondary",  icon:FileText },
                { label:"Submit Work",     to:"/submit",    color:"btn-ghost",      icon:Activity },
                { label:"Approve Payment", to:"/approve",   color:"btn-success",    icon:CheckCircle },
                { label:"Dispute Center",  to:"/dispute",   color:"btn-danger",      icon:AlertTriangle },
              ].map(a => (
                <button
                  key={a.label}
                  id={`btn-quick-${a.label.toLowerCase().replace(/\s+/g,"-")}`}
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
