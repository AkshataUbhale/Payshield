import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, DollarSign, Briefcase } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import JobFilter from "../../components/jobs/JobFilter";
import JobCard from "../../components/jobs/JobCard";
import * as api from "../../services/api";

const ALL_JOBS = [
  { id: "1", title: "React Developer Needed", budget: 500, skills: ["React", "Node.js", "TypeScript"],
    deadline: "2026-03-25", status: "Open", clientName: "TechCorp Inc.",
    description: "Build a responsive dashboard UI with React and a Node.js backend API." },
  { id: "2", title: "Solidity Smart Contract Dev", budget: 1200, skills: ["Solidity", "Ethereum", "Web3.js", "DeFi"],
    deadline: "2026-04-01", status: "Open", clientName: "DeFi Labs",
    description: "Develop ERC-20 token contract with vesting and multi-sig capabilities." },
  { id: "3", title: "UI/UX Designer for SaaS", budget: 350, skills: ["Figma", "UI/UX", "Prototyping"],
    deadline: "2026-03-20", status: "Open", clientName: "StartupHQ",
    description: "Design user flows and high-fidelity mockups for a B2B SaaS product." },
  { id: "4", title: "Python ML Engineer", budget: 800, skills: ["Python", "TensorFlow", "AWS"],
    deadline: "2026-04-10", status: "Open", clientName: "AI Research Ltd.",
    description: "Build and train classification model for image recognition pipeline." },
  { id: "5", title: "Full Stack MERN Developer", budget: 650, skills: ["React", "MongoDB", "Node.js", "Express"],
    deadline: "2026-03-28", status: "Open", clientName: "E-Commerce Co.",
    description: "Develop complete e-commerce platform with payment gateway integration." },
  { id: "6", title: "DevOps / AWS Engineer", budget: 900, skills: ["AWS", "Docker", "Kubernetes", "DevOps"],
    deadline: "2026-04-05", status: "Open", clientName: "Cloud Systems Inc.",
    description: "Set up CI/CD pipeline and manage Kubernetes cluster for microservices." },
];

export default function RecommendedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState({ skills: [], budget: { min: 0, max: Infinity } });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("ps_user") ? JSON.parse(sessionStorage.getItem("ps_user")).token : null;
      const data = await api.getContracts(token);
      
      const projects = Array.isArray(data) ? data : (data.projects || []);
      
      // Filter open jobs
      const openJobs = projects.filter(p => p.status === "open" || p.status === "Open" || !p.status);

      const mappedJobs = openJobs.map(j => {
        // Retrieve skills list by extracting from description/text if not an explicit list
        const text = `${j.title} ${j.description}`.toLowerCase();
        const extractedSkills = ["React", "Node.js", "Solidity", "Python", "Figma", "TypeScript", "Vue", "GraphQL", "AWS", "Docker", "Kubernetes", "DevOps"].filter(
          s => text.includes(s.toLowerCase())
        );

        return {
          id: j.projectId || j.id,
          title: j.title,
          budget: j.budget,
          skills: extractedSkills.length > 0 ? extractedSkills : ["Web3.js"],
          deadline: j.deadline ? new Date(j.deadline).toLocaleDateString() : "Flexible",
          status: "Open",
          clientName: j.clientPubkey ? `${j.clientPubkey.slice(0, 6)}...${j.clientPubkey.slice(-4)}` : "TechCorp Inc.",
          description: j.description
        };
      });

      setJobs(mappedJobs.length > 0 ? mappedJobs : ALL_JOBS);
    } catch (err) {
      console.error("Failed to load browse jobs from API:", err);
      setJobs(ALL_JOBS);
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobs.filter(job => {
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
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                <span className="spinner" /> Loading active jobs from escrow...
              </div>
            ) : (
              filtered.map(job => (
                <JobCard key={job.id} job={job}
                  onClick={() => navigate(`/freelancer/job/${job.id}`)} />
              ))
            )}
            {!loading && !filtered.length && (
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
