import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import * as api from "../../services/api";
import { Bot, Sparkles, Briefcase, DollarSign, Clock, ChevronRight, Search } from "lucide-react";

// ── Mock user profile fallback ───────────────────────────────────────────────
const USER_SKILLS = ["React", "Node.js", "TypeScript", "Solidity", "Web3.js"];

// ── Known Skills for Text Parsing fallback ─────────────────────────────────────
const KNOWN_SKILLS = [
  "React", "Node.js", "TypeScript", "Solidity", "Web3.js", "Rust", "Anchor", 
  "Figma", "UI/UX", "Prototyping", "CSS", "Python", "TensorFlow", "AWS", 
  "Docker", "Kubernetes", "DevOps", "Vue", "GraphQL", "Ethereum", "DeFi", "Solana"
];

function getProjectSkills(project) {
  if (project.skills && project.skills.length > 0) return project.skills;
  const text = `${project.title || ""} ${project.description || ""}`.toLowerCase();
  return KNOWN_SKILLS.filter(s => text.includes(s.toLowerCase()));
}

// ── Browse Jobs Dataset fallback ─────────────────────────────────────────────
const ALL_JOBS = [
  {
    id: "P-101",
    title: "React Developer Needed",
    description: "Build a responsive dashboard UI with React and a Node.js backend API.",
    budget: 500,
    skills: ["React", "Node.js", "TypeScript"],
    deadline: new Date(Date.now() + 86400000 * 5),
    clientPubkey: "HN7cAB...",
    status: "open"
  },
  {
    id: "P-102",
    title: "Solana Smart Contract Dev (Vesting)",
    description: "Design an Anchor program to lock and unlock milestone Solana tokens for freelance payouts. Requires Solidity, Rust, and Web3.js.",
    budget: 1200,
    skills: ["Solidity", "Rust", "Web3.js", "Anchor"],
    deadline: new Date(Date.now() + 86400000 * 10),
    clientPubkey: "Fj8asP...",
    status: "open"
  },
  {
    id: "P-103",
    title: "UI/UX Designer for SaaS",
    description: "Design user flows and high-fidelity mockups for a B2B SaaS product.",
    budget: 350,
    skills: ["Figma", "UI/UX", "Prototyping"],
    deadline: new Date(Date.now() + 86400000 * 4),
    clientPubkey: "HN7cAB...",
    status: "open"
  },
  {
    id: "P-104",
    title: "Python ML Engineer",
    description: "Build and train classification model for image recognition pipeline with TensorFlow.",
    budget: 800,
    skills: ["Python", "TensorFlow", "AWS"],
    deadline: new Date(Date.now() + 86400000 * 15),
    clientPubkey: "Fj8asP...",
    status: "open"
  },
  {
    id: "P-105",
    title: "Full Stack MERN Developer",
    description: "Develop complete e-commerce platform with React, MongoDB, Node.js, and Express.",
    budget: 650,
    skills: ["React", "MongoDB", "Node.js", "Express"],
    deadline: new Date(Date.now() + 86400000 * 8),
    clientPubkey: "HN7cAB...",
    status: "open"
  },
  {
    id: "P-106",
    title: "DevOps / AWS Engineer",
    description: "Set up CI/CD pipeline and manage Kubernetes cluster for microservices with Docker.",
    budget: 900,
    skills: ["AWS", "Docker", "Kubernetes", "DevOps"],
    deadline: new Date(Date.now() + 86400000 * 12),
    clientPubkey: "Fj8asP...",
    status: "open"
  }
];

// ── Score badge color ───────────────────────────────────────────────────────
function getScoreColor(score) {
  if (score >= 90) return "#10b981"; // Hyper Green
  if (score >= 70) return "#f59e0b"; // Amber
  if (score >= 50) return "#3b82f6"; // Electric Blue
  return "#ef4444"; // Red
}

function getScoreLabel(score) {
  if (score >= 90) return "Excellent Match";
  if (score >= 70) return "Good Match";
  if (score >= 50) return "Moderate Match";
  return "Low Match";
}

// ── Circular progress ring ──────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 20, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = getScoreColor(score);
  return (
    <svg width={52} height={52} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={4} />
      <circle
        cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text
        x={26} y={26}
        textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg) translate(0px, -52px)", transformOrigin: "26px 26px" }}
        fill={color} fontSize={10} fontWeight={700}
      >
        {score}%
      </text>
    </svg>
  );
}

// ── Job Card ────────────────────────────────────────────────────────────────
function AIJobCard({ recommendation, onApply, onClick }) {
  const { project, matchScore, category, matchedSkills, missingSkills } = recommendation;

  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${matchScore >= 90 ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16, padding: "20px 24px",
        display: "flex", gap: 20, alignItems: "flex-start",
        transition: "all 0.25s ease",
        position: "relative", overflow: "hidden",
        cursor: "pointer"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.15)";
        e.currentTarget.style.borderColor = matchScore >= 90 ? "rgba(16,185,129,0.4)" : "rgba(99,102,241,0.3)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.025)";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = matchScore >= 90 ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)";
      }}
    >
      {/* Top Recommended badge for high match */}
      {matchScore >= 90 && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.1))",
          border: "1px solid rgba(16,185,129,0.35)",
          borderRadius: 20, padding: "3px 10px",
          fontSize: 10, fontWeight: 700, color: "#10b981", letterSpacing: 0.5,
          display: "flex", alignItems: "center", gap: 5
        }}>
          <Bot size={10} /> AI TOP PICK
        </div>
      )}

      {/* Score ring */}
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        <ScoreRing score={matchScore} />
        <div style={{ fontSize: 9, color: getScoreColor(matchScore), fontWeight: 600, marginTop: 2, whiteSpace: "nowrap" }}>
          {getScoreLabel(matchScore)}
        </div>
      </div>

      {/* Job info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{project.title}</h3>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
            background: "rgba(99,102,241,0.12)", color: "var(--accent-purple)"
          }}>
            {category}
          </span>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
          {project.description}
        </p>

        {/* Matched skills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {matchedSkills.map(s => (
            <span key={s} style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 600,
              background: "rgba(16,185,129,0.12)", color: "#10b981",
              border: "1px solid rgba(16,185,129,0.25)"
            }}>✓ {s}</span>
          ))}
          {missingSkills && missingSkills.map(s => (
            <span key={s} style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 600,
              background: "rgba(255,255,255,0.04)", color: "var(--text-muted)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}>{s}</span>
          ))}
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <DollarSign size={12} style={{ color: "#10b981" }} />
            <strong style={{ color: "#10b981" }}>{project.budget}</strong> SOL/USDC
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={12} /> Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <Briefcase size={12} /> {project.clientPubkey.slice(0, 6)}...{project.clientPubkey.slice(-4)}
          </span>
        </div>
      </div>

      {/* Apply button */}
      <div style={{ flexShrink: 0 }}>
        <button
          id={`btn-apply-job-${project.id}`}
          className="btn btn-primary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onApply(project);
          }}
          style={{ borderRadius: 10 }}
        >
          Apply <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Job Recommendation Scoring Algorithm ──────────────────────────────────────
function calculateJobMatchScore(project, freelancerSkills, freelancerRate = 35) {
  const title = project.title || "";
  const desc = project.description || "";
  const projectText = `${title} ${desc}`.toLowerCase();
  
  // Retrieve job's required skills from its array or dynamically extract from title & description
  const requiredSkills = getProjectSkills(project);
  
  // 1. Skill overlap (60% weight) - intersection between freelancer skills and project's required skills
  const matchedSkills = requiredSkills.filter(skill =>
    freelancerSkills.some(fs => fs.toLowerCase() === skill.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(skill =>
    !freelancerSkills.some(fs => fs.toLowerCase() === skill.toLowerCase())
  );
  
  const skillScore = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
    : 100;

  // 2. Budget match (20% weight)
  const projectBudget = project.budget || 500;
  const expectedSize = freelancerRate * 20; // assumed 20h effort
  
  let budgetScore = 100;
  if (projectBudget < expectedSize) {
    budgetScore = Math.max(0, Math.round((projectBudget / expectedSize) * 100));
  } else {
    budgetScore = Math.max(0, Math.round(100 - ((projectBudget - expectedSize) / expectedSize) * 20));
  }

  // 3. Category matching (20% weight)
  const categories = ["frontend", "backend", "full stack", "blockchain", "design", "marketing", "web3"];
  let matchedCategory = "General";
  let categoryScore = 50;

  for (const cat of categories) {
    if (projectText.includes(cat)) {
      matchedCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (freelancerSkills.some(s => s.toLowerCase().includes(cat))) {
        categoryScore = 100;
      }
      break;
    }
  }

  // Compute total weighted score
  const matchScore = Math.round((skillScore * 0.6) + (budgetScore * 0.2) + (categoryScore * 0.2));

  return {
    matchScore,
    category: matchedCategory,
    matchedSkills,
    missingSkills,
  };
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AIRecommendations() {
  const navigate = useNavigate();
  const [userSkills, setUserSkills] = useState(USER_SKILLS);
  const [skillInput, setSkillInput] = useState(USER_SKILLS.join(", "));
  const [editMode, setEditMode] = useState(false);
  const [filterMin, setFilterMin] = useState(0);
  const [search, setSearch] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userSkills]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("ps_user") ? JSON.parse(sessionStorage.getItem("ps_user")).token : null;
      
      // Fetch open jobs from backend API
      const data = await api.getContracts(token);
      const projects = Array.isArray(data) ? data : (data.projects || []);
      const openProjects = projects.filter(p => p.status === "open");

      // Merge open projects with mock browse jobs if empty
      const mergedList = openProjects.length > 0 ? openProjects : ALL_JOBS;

      // Dynamic scoring against active skills
      const recs = mergedList.map(project => {
        const scoreData = calculateJobMatchScore(project, userSkills);
        return {
          project: {
            id: project.projectId || project.id,
            title: project.title,
            description: project.description,
            budget: project.budget,
            deadline: project.deadline,
            clientPubkey: project.clientPubkey || "HN7cAB...",
            status: project.status,
            skills: project.skills || []
          },
          ...scoreData
        };
      });

      recs.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendations(recs);
    } catch (err) {
      console.error("Failed to load AI job recommendations:", err);
      // Fallback dynamic scoring on ALL_JOBS browse list
      const recs = ALL_JOBS.map(project => {
        const scoreData = calculateJobMatchScore(project, userSkills);
        return {
          project,
          ...scoreData
        };
      });
      recs.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendations(recs);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSkills = () => {
    const parsed = skillInput.split(",").map(s => s.trim()).filter(Boolean);
    setUserSkills(parsed);
    setEditMode(false);
  };

  const filteredRecs = recommendations.filter(rec => {
    const q = search.toLowerCase();
    const matchesQuery = 
      rec.project.title.toLowerCase().includes(q) || 
      rec.project.description.toLowerCase().includes(q) || 
      rec.category.toLowerCase().includes(q);
    
    return rec.matchScore >= filterMin && matchesQuery;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">AI Job Recommendations</span>
            <span className="topbar-breadcrumb">Ranked by your Solana & Web3 skill match</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div className="page-container">
          {/* AI Skill Panel */}
          <div style={{
            background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(59,130,246,0.05))",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 16, padding: "20px 24px", marginBottom: 24,
            display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap"
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "rgba(99,102,241,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Bot size={22} style={{ color: "#6366f1" }} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span>AI Skill Engine</span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                  background: "rgba(99,102,241,0.15)", color: "#a5b4fc"
                }}>ACTIVE</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px" }}>
                Jobs are parsed in real-time and ranked against your custom profile skills. Edit your stack below to recalibrate.
              </p>
              {editMode ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    className="form-input"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    placeholder="React, TypeScript, Node.js, Solidity, Web3.js, Anchor, Rust..."
                    style={{ flex: 1, minWidth: 200, fontSize: 13, height: 38 }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleSaveSkills}>
                    Recalibrate AI ✦
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {userSkills.map(s => (
                    <span key={s} style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                      background: "rgba(99,102,241,0.12)", color: "var(--accent-purple)",
                      border: "1px solid rgba(99,102,241,0.2)"
                    }}>
                      {s}
                    </span>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(true)} style={{ fontSize: 12 }}>
                    Edit Skills
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                className="form-input"
                placeholder="Search matching projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, fontSize: 13, width: "100%", height: 40 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "All Match", min: 0 },
                { label: "≥50% Match", min: 50 },
                { label: "≥70% Match", min: 70 },
                { label: "≥90% Match", min: 90 },
              ].map(f => (
                <button
                  key={f.label}
                  className={filterMin === f.min ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                  onClick={() => setFilterMin(f.min)}
                  style={{ fontSize: 12 }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results summary */}
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Bot size={13} style={{ color: "var(--accent-purple)" }} />
            Showing <strong style={{ color: "var(--text-primary)", margin: "0 4px" }}>{filteredRecs.length}</strong> of {recommendations.length} Solana contracts scored
          </div>

          {/* Job Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <span className="spinner" /> Analyzing Web3 jobs...
              </div>
            ) : (
              filteredRecs.map(rec => (
                <AIJobCard
                  key={rec.project.id || rec.project.projectId} 
                  recommendation={rec}
                  onClick={() => navigate(`/freelancer/job/${rec.project.id || rec.project.projectId}`)}
                  onApply={j => navigate(`/freelancer/apply/${j.id || j.projectId}`)}
                />
              ))
            )}
            {!loading && filteredRecs.length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No matches found</div>
                <div style={{ fontSize: 13 }}>Try editing your profile skills or lower the match criteria.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
