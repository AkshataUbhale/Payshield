import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import JobFilter from "../../components/jobs/JobFilter";
import JobCard from "../../components/jobs/JobCard";
import { getRecommendedJobs, getOpenProjects } from "../../services/api";

export default function RecommendedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterState, setFilterState] = useState({ skills: [], budget: { min: 0, max: Infinity } });

  // Fetch AI-recommended and open jobs from backend
  useEffect(() => {
    const token = sessionStorage.getItem("ps_token");
    getRecommendedJobs(token)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(item => {
            if (item.project) {
              return {
                id: item.project.id || item.project.projectId || item.project._id,
                title: item.project.title,
                description: item.project.description,
                budget: item.project.budget,
                deadline: item.project.deadline,
                clientPubkey: item.project.clientPubkey,
                status: item.project.status,
                skills: item.matchedSkills || item.project.skills || [],
                matchScore: item.matchScore,
                clientName: "Client " + (item.project.clientPubkey ? `${item.project.clientPubkey.slice(0, 6)}...${item.project.clientPubkey.slice(-4)}` : "Unknown")
              };
            }
            return { ...item, skills: item.skills || [] };
          });
          setJobs(mapped);
        } else {
          // Fallback to open projects list from MongoDB
          return getOpenProjects(token).then(openData => {
            const list = Array.isArray(openData) ? openData : [];
            const mapped = list.map(p => ({
              id: p.projectId || p._id,
              title: p.title,
              description: p.description,
              budget: p.budget,
              deadline: p.deadline,
              clientPubkey: p.clientPubkey,
              status: p.status,
              skills: p.skills || [],
              clientName: "Client " + (p.clientPubkey ? `${p.clientPubkey.slice(0, 6)}...${p.clientPubkey.slice(-4)}` : "Unknown")
            }));
            setJobs(mapped);
          });
        }
      })
      .catch(() => {
        getOpenProjects(token)
          .then(openData => {
            const list = Array.isArray(openData) ? openData : [];
            const mapped = list.map(p => ({
              id: p.projectId || p._id,
              title: p.title,
              description: p.description,
              budget: p.budget,
              deadline: p.deadline,
              clientPubkey: p.clientPubkey,
              status: p.status,
              skills: p.skills || [],
              clientName: "Client " + (p.clientPubkey ? `${p.clientPubkey.slice(0, 6)}...${p.clientPubkey.slice(-4)}` : "Unknown")
            }));
            setJobs(mapped);
          })
          .catch(() => setJobs([]));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(job => {
    const matchSearch = job.title?.toLowerCase().includes(search.toLowerCase()) ||
      (job.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchBudget = job.budget >= filterState.budget.min && job.budget <= filterState.budget.max;
    const matchSkills = filterState.skills.length === 0 ||
      filterState.skills.some(s => (job.skills || []).map(x => x.toLowerCase()).includes(s.toLowerCase()));
    return matchSearch && matchBudget && matchSkills;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Browse Jobs</span>
            <span className="topbar-breadcrumb">{jobs.length} available jobs on PayShield</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div className="page-container">
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Search size={16} style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }} />
            <input
              className="form-input input-with-icon"
              placeholder="Search by title, skill, or keyword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", fontSize: 15, padding: "14px 16px 14px 44px" }}
            />
          </div>

          {/* Filter */}
          <JobFilter onFilter={setFilterState} />

          {/* Results */}
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of {jobs.length} jobs
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map(job => (
              <JobCard key={job.id} job={job}
                onClick={() => navigate(`/freelancer/job/${job.id}`)} />
            ))}
            {!filtered.length && (
              <div className="card" style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No jobs found</div>
                <div style={{ fontSize: 13 }}>Try adjusting your filters or search terms.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
