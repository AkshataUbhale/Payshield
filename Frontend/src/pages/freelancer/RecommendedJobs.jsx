import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import JobFilter from "../../components/jobs/JobFilter";
import JobCard from "../../components/jobs/JobCard";

const ALL_JOBS = [
  { id: 1, title: "React Developer Needed", budget: 500, skills: ["React", "Node.js", "TypeScript"],
    deadline: "2026-03-25", status: "Open", clientName: "TechCorp Inc.",
    description: "Build a responsive dashboard UI with React and a Node.js backend API." },
  { id: 2, title: "Solidity Smart Contract Dev", budget: 1200, skills: ["Solidity", "Ethereum", "Web3", "DeFi"],
    deadline: "2026-04-01", status: "Open", clientName: "DeFi Labs",
    description: "Develop ERC-20 token contract with vesting and multi-sig capabilities." },
  { id: 3, title: "UI/UX Designer for SaaS", budget: 350, skills: ["Figma", "UI/UX", "Prototyping"],
    deadline: "2026-03-20", status: "Open", clientName: "StartupHQ",
    description: "Design user flows and high-fidelity mockups for a B2B SaaS product." },
  { id: 4, title: "Python ML Engineer", budget: 800, skills: ["Python", "TensorFlow", "AWS"],
    deadline: "2026-04-10", status: "Open", clientName: "AI Research Ltd.",
    description: "Build and train classification model for image recognition pipeline." },
  { id: 5, title: "Full Stack MERN Developer", budget: 650, skills: ["React", "MongoDB", "Node.js", "Express"],
    deadline: "2026-03-28", status: "Open", clientName: "E-Commerce Co.",
    description: "Develop complete e-commerce platform with payment gateway integration." },
  { id: 6, title: "DevOps / AWS Engineer", budget: 900, skills: ["AWS", "Docker", "Kubernetes", "DevOps"],
    deadline: "2026-04-05", status: "Open", clientName: "Cloud Systems Inc.",
    description: "Set up CI/CD pipeline and manage Kubernetes cluster for microservices." },
];

export default function RecommendedJobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState({ skills: [], budget: { min: 0, max: Infinity } });

  const filtered = ALL_JOBS.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchBudget = job.budget >= filterState.budget.min && job.budget <= filterState.budget.max;
    const matchSkills = filterState.skills.length === 0 ||
      filterState.skills.some(s => job.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()));
    return matchSearch && matchBudget && matchSkills;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Browse Jobs</span>
            <span className="topbar-breadcrumb">{ALL_JOBS.length} available jobs on PayShield</span>
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
            Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of {ALL_JOBS.length} jobs
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
