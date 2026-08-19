import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ContractCard from "../components/ContractCard";
import { Search, Filter, Plus } from "lucide-react";
import { getContracts } from "../services/api";

const FILTERS = ["All", "Active", "Pending", "Submitted", "Disputed", "Completed"];

export default function Contracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("ps_token");
    getContracts({}, token)
      .then(data => {
        const list = data.projects ?? data ?? [];
        if (Array.isArray(list)) {
          setContracts(list.map(c => ({
            id: c.projectId,
            title: c.title,
            description: c.description,
            amount: c.budget,
            status: c.status === "open" ? "Pending" : c.status === "in_progress" ? "Active" : c.status === "completed" ? "Completed" : c.status,
            freelancer: c.freelancerPubkey ? `${c.freelancerPubkey.slice(0, 6)}...${c.freelancerPubkey.slice(-4)}` : "Unassigned",
            client: c.clientPubkey ? `${c.clientPubkey.slice(0, 6)}...${c.clientPubkey.slice(-4)}` : "Unknown",
            milestone: "Primary Milestone",
            progress: c.status === "completed" ? 100 : c.status === "in_progress" ? 50 : 0,
            createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today"
          })));
        } else {
          setContracts([]);
        }
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, []);

  const totalValue = contracts.reduce((sum, c) => sum + (c.amount || 0), 0);

  const filtered = contracts.filter(c => {
    const matchFilter = filter === "All" || c.status === filter;
    const matchSearch = !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.freelancer?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? contracts.length : contracts.filter(c => c.status === f).length;
    return acc;
  }, {});

  return (
    <div className="app-layout">
      <Sidebar />
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
              { label:"Total Value",    value:`$${totalValue}`, color:"purple" },
              { label:"Active",         value:`${counts.Active || 0}`,    color:"green"  },
              { label:"Pending Review", value:`${counts.Pending || 0}`, color:"blue"   },
              { label:"Disputed",       value:`${counts.Disputed || 0}`,  color:"amber"  },
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
