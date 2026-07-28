import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ContractCard from "../components/ContractCard";
import { Search, Filter, Plus } from "lucide-react";

const ALL_CONTRACTS = [
  {
    id: 1, title:"Logo & Brand Identity", freelancer:"0x1a2b...c3d4", client:"0xA1B2...D3E4",
    amount:200, status:"Active", milestone:"Design Mockup", progress:60,
    createdAt:"Mar 10, 2025", description:"Professional logo design with full brand guidelines and asset kit."
  },
  {
    id: 2, title:"Smart Contract Development", freelancer:"0x5e6f...7a8b", client:"0xA1B2...D3E4",
    amount:800, status:"Submitted", milestone:"Testing & Deployment", progress:100,
    createdAt:"Mar 8, 2025", description:"ERC-20 token + staking contract with full test suite and deployment scripts."
  },
  {
    id: 3, title:"Content Writing — 10 Articles", freelancer:"0x9c0d...e1f2", client:"0xA1B2...D3E4",
    amount:120, status:"Pending", milestone:"Draft 1 Submission", progress:0,
    createdAt:"Mar 12, 2025", description:"SEO-optimized articles on blockchain, DeFi, and Web3 topics."
  },
  {
    id: 4, title:"Mobile App UI Design", freelancer:"0x2c3d...4e5f", client:"0xA1B2...D3E4",
    amount:450, status:"Active", milestone:"Figma Prototypes", progress:35,
    createdAt:"Mar 5, 2025", description:"End-to-end Figma design for a DeFi portfolio tracker mobile app."
  },
  {
    id: 5, title:"SEO Audit & Strategy", freelancer:"0x6g7h...8i9j", client:"0xA1B2...D3E4",
    amount:300, status:"Disputed", milestone:"Final Report", progress:80,
    createdAt:"Feb 28, 2025", description:"Comprehensive SEO audit with 90-day growth strategy."
  },
  {
    id: 6, title:"Backend API Development", freelancer:"0xAaB...CcDd", client:"0xA1B2...D3E4",
    amount:1200, status:"Completed", milestone:"All Milestones", progress:100,
    createdAt:"Feb 20, 2025", description:"Node.js REST API with PostgreSQL, Docker, and CI/CD pipeline."
  },
];

const FILTERS = ["All", "Active", "Pending", "Submitted", "Disputed", "Completed"];

export default function Contracts() {
  const navigate = useNavigate();
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");

  const filtered = ALL_CONTRACTS.filter(c => {
    const matchFilter = filter === "All" || c.status === filter;
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.freelancer.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? ALL_CONTRACTS.length : ALL_CONTRACTS.filter(c => c.status === f).length;
    return acc;
  }, {});

  return (
    <div className="app-layout">
      <Sidebar walletAddress="0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12" />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Contracts</span>
            <span className="topbar-breadcrumb">Dashboard / Active Contracts</span>
          </div>
          <div className="topbar-right">
            <button
              id="btn-new-contract"
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/create")}
            >
              <Plus size={14}/> New Contract
            </button>
          </div>
        </div>

        <div className="page-container">
          {/* Search + Filter */}
          <div className="flex-between mb-6" style={{ gap:16, flexWrap:"wrap" }}>
            <div className="input-group" style={{ flex:1, minWidth:220, maxWidth:380 }}>
              <Search className="input-icon" size={15} />
              <input
                id="input-search-contracts"
                className="form-input input-with-icon"
                placeholder="Search contracts…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  id={`filter-${f.toLowerCase()}`}
                  onClick={() => setFilter(f)}
                  className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
                >
                  {f}
                  {counts[f] > 0 && (
                    <span style={{
                      background: filter === f ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                      borderRadius:20, padding:"1px 6px", fontSize:10, marginLeft:4
                    }}>
                      {counts[f]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid-4 mb-6">
            {[
              { label:"Total Value",    value:"$3,070", color:"purple" },
              { label:"Active",         value:`${counts.Active}`,    color:"green"  },
              { label:"Pending Review", value:`${counts.Submitted}`, color:"blue"   },
              { label:"Disputed",       value:`${counts.Disputed}`,  color:"amber"  },
            ].map(s => (
              <div key={s.label} className="card card-sm">
                <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:4 }}>{s.label}</div>
                <div style={{
                  fontSize:22, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif",
                  color: s.color === "purple" ? "var(--accent-purple)"
                       : s.color === "green"  ? "var(--accent-green)"
                       : s.color === "blue"   ? "var(--accent-blue)"
                       : "var(--accent-amber)"
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Contract Grid */}
          {filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-title">No contracts found</div>
                <div className="empty-state-desc">Try adjusting your search or filter.</div>
                <button className="btn btn-primary" onClick={() => navigate("/create")}>
                  <Plus size={15}/> Create Your First Contract
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:20 }}>
              {filtered.map(c => (
                <ContractCard
                  key={c.id}
                  contract={c}
                  onClick={() => navigate(`/contract/${c.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
