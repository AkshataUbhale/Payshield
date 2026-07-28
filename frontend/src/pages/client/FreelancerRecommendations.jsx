import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bot, Sparkles, Star, MapPin, DollarSign, Award, ArrowUpRight, HelpCircle, Briefcase, ChevronRight } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import * as api from "../../services/api";

// ── Mock Freelancers List ───────────────────────────────────────────────────
const ALL_FREELANCERS = [
  { id: "f1", name: "Alex Johnson",    skills: ["React","Node.js","TypeScript","Web3.js"], rating: 4.9, hourlyRate: 45, completedJobs: 34,
    bio: "Full-stack developer specializing in React and blockchain integrations.", location: "USA" },
  { id: "f2", name: "Priya Sharma",    skills: ["Solidity","Ethereum","Web3.js","DeFi","Solana"], rating: 4.7, hourlyRate: 60, completedJobs: 22,
    bio: "Smart contract developer with 3 years of DeFi and NFT experience.", location: "India" },
  { id: "f3", name: "Carlos Rivera",   skills: ["Figma","UI/UX","Prototyping","CSS"],   rating: 4.8, hourlyRate: 35, completedJobs: 51,
    bio: "UI/UX designer crafting delightful, conversion-focused digital experiences.", location: "Spain" },
  { id: "f4", name: "Yuki Tanaka",     skills: ["Python","TensorFlow","AWS","Data","AI"], rating: 4.6, hourlyRate: 55, completedJobs: 18,
    bio: "ML engineer building production-grade models for real-world applications.", location: "Japan" },
  { id: "f5", name: "Omar Khalid",     skills: ["DevOps","Docker","Kubernetes","AWS"],  rating: 4.9, hourlyRate: 65, completedJobs: 40,
    bio: "Cloud infrastructure expert. CI/CD pipelines, microservices, and Kubernetes.", location: "UAE" },
  { id: "f6", name: "Sophie Müller",   skills: ["Vue","GraphQL","TypeScript","Node.js"],rating: 4.7, hourlyRate: 40, completedJobs: 27,
    bio: "Frontend architect with specialization in Vue and GraphQL architecture.", location: "Germany" },
];

// ── Fallback Demo Jobs if Client Has No Jobs Posted ─────────────────────────
const DEMO_JOBS = [
  {
    id: "demo-1",
    title: "Solana Smart Contract Dev (Vesting & Escrow)",
    description: "Design an Anchor program to lock and unlock milestone Solana tokens for freelance payouts. Requires Solidity, Rust, and Web3.js.",
    budget: 1200,
    status: "open"
  },
  {
    id: "demo-2",
    title: "React Web3 Portfolio Dashboard",
    description: "Build a beautiful responsive portfolio frontend dashboard with Solana wallet adapter integration using React and TypeScript.",
    budget: 600,
    status: "open"
  },
  {
    id: "demo-3",
    title: "UI/UX Redesign for Escrow Platform",
    description: "Craft a futuristic cyber-synth design system on Figma and implement it with modern CSS and React.",
    budget: 450,
    status: "open"
  }
];

// ── Score Color ─────────────────────────────────────────────────────────────
function getScoreColor(score) {
  if (score >= 90) return "#10b981"; // Hyper Green
  if (score >= 70) return "#f59e0b"; // Neon Orange
  if (score >= 50) return "#3b82f6"; // Electric Blue
  return "#ef4444"; // Vivid Red
}

function getScoreLabel(score) {
  if (score >= 90) return "Excellent Match";
  if (score >= 70) return "Good Match";
  if (score >= 50) return "Moderate Match";
  return "Low Match";
}

// ── Dynamic Rationale ───────────────────────────────────────────────────────
function getMatchRationale(score, freelancer, project) {
  if (score >= 90) return "Top choice: Exceptional skill overlap and stellar completion rates.";
  if (score >= 70) return "Solid candidate: Balanced rating and rate profile matches expectations.";
  if (score >= 50) return "Moderate match: Meets core stack requirements with good rate alignment.";
  return "Partial match: Missing core technical stack but features excellent overall ratings.";
}

// ── Circular Progress Ring ──────────────────────────────────────────────────
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

// ── Recommendation Score Engine ─────────────────────────────────────────────
function calculateMatchScore(freelancer, project) {
  if (!project) return { matchScore: 0, matchedSkills: [], missingSkills: freelancer.skills };

  const projectText = `${project.title} ${project.description}`.toLowerCase();
  const skills = freelancer.skills || [];
  
  // 1. Skill overlap (50% weight)
  const matchedSkills = skills.filter(skill =>
    projectText.includes(skill.toLowerCase())
  );
  const skillScore = skills.length > 0
    ? Math.round((matchedSkills.length / Math.max(1, skills.length)) * 100)
    : 0;

  // 2. Rating & History (30% weight)
  const ratingScore = (freelancer.rating || 0) * 20; // 5 stars -> 100
  const completedJobsScore = Math.min(100, (freelancer.completedJobs || 0) * 10);
  const historyScore = Math.round((ratingScore * 0.7) + (completedJobsScore * 0.3));

  // 3. Rate Fit (20% weight)
  const freelancerRate = freelancer.hourlyRate || 30;
  // Assumed 25 hours efforts for the project
  const projectHourlyEquivalent = project.budget ? (project.budget / 25) : 30;

  let rateScore = 100;
  if (freelancerRate > projectHourlyEquivalent) {
    rateScore = Math.max(0, Math.round((projectHourlyEquivalent / freelancerRate) * 100));
  }

  const matchScore = Math.round((skillScore * 0.5) + (historyScore * 0.3) + (rateScore * 0.2));

  return {
    matchScore,
    matchedSkills,
    missingSkills: skills.filter(s => !matchedSkills.includes(s))
  };
}

export default function FreelancerRecommendations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [clientJobs, setClientJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterMin, setFilterMin] = useState(0);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // ── Retrieve Current Logged In Client details ──────────────────────────────
  const userStr = sessionStorage.getItem("ps_user");
  const clientUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchClientProjects();
  }, []);

  const fetchClientProjects = async () => {
    setLoadingJobs(true);
    try {
      const token = clientUser ? clientUser.token : null;
      const data = await api.getContracts(token);
      
      // Handle response structure differences
      const projects = Array.isArray(data) ? data : (data.projects || []);
      
      // Filter projects that belong to this client
      const myProjects = projects.filter(
        p => p.clientPubkey === clientUser?.walletAddress || p.clientPubkey === clientUser?.id
      );

      setClientJobs(myProjects);
      if (myProjects.length > 0) {
        setSelectedJob(myProjects[0]);
      } else {
        setSelectedJob(DEMO_JOBS[0]);
      }
    } catch (err) {
      console.error("Failed to fetch client contracts:", err);
      // Fail over to demo projects
      setClientJobs([]);
      setSelectedJob(DEMO_JOBS[0]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const activeJobs = clientJobs.length > 0 ? clientJobs : DEMO_JOBS;

  // ── Calculate dynamic scores and sort freelancers ──────────────────────────
  const recommendations = ALL_FREELANCERS.map(freelancer => {
    const analysis = calculateMatchScore(freelancer, selectedJob);
    return {
      freelancer,
      ...analysis,
      rationale: getMatchRationale(analysis.matchScore, freelancer, selectedJob)
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  const filteredRecs = recommendations.filter(rec => {
    const q = search.toLowerCase();
    const nameMatches = rec.freelancer.name.toLowerCase().includes(q);
    const bioMatches = (rec.freelancer.bio || "").toLowerCase().includes(q);
    const skillMatches = rec.freelancer.skills.some(s => s.toLowerCase().includes(q));

    return rec.matchScore >= filterMin && (nameMatches || bioMatches || skillMatches);
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">AI Freelancer Picks</span>
            <span className="topbar-breadcrumb">Top Web3 experts ranked for your requirements</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div className="page-container">
          {/* AI Skill Matching Panel */}
          <div style={{
            background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.05))",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 16, padding: "20px 24px", marginBottom: 24,
            display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap"
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "rgba(6,182,212,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Bot size={22} style={{ color: "#06b6d4" }} />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span>AI Matching Engine</span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                  background: "rgba(6,182,212,0.15)", color: "#22d3ee"
                }}>ACTIVE</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
                Select one of your posted jobs to rank freelancers dynamically in real-time. Missing skills are flagged automatically.
              </p>

              {/* Job Selector Dropdown */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
                  <select
                    className="form-select"
                    value={selectedJob ? selectedJob.id || selectedJob.projectId : ""}
                    onChange={e => {
                      const selected = activeJobs.find(
                        j => (j.id || j.projectId) === e.target.value
                      );
                      setSelectedJob(selected);
                    }}
                    style={{
                      width: "100%", fontSize: 13, height: 40,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--text-primary)", borderRadius: 10, padding: "0 12px"
                    }}
                  >
                    {activeJobs.map(job => (
                      <option key={job.id || job.projectId} value={job.id || job.projectId}>
                        {job.title} ({job.budget} USDC)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate("/client/post-job")}
                  style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, height: 38 }}
                >
                  <Briefcase size={12} /> Post New Job
                </button>
              </div>

              {clientJobs.length === 0 && (
                <div style={{ marginTop: 12, fontSize: 11, color: "#6366f1", display: "flex", alignItems: "center", gap: 5 }}>
                  ✨ Showing Demo Projects. Post a job in your dashboard to view matches against your actual contracts!
                </div>
              )}
            </div>
          </div>

          {/* Search & Score Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                className="form-input"
                placeholder="Search matching freelancers by name or skills..."
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
            <Bot size={13} style={{ color: "#06b6d4" }} />
            Showing <strong style={{ color: "var(--text-primary)" }}>{filteredRecs.length}</strong> of {ALL_FREELANCERS.length} freelancers ranked for your job
          </div>

          {/* Freelancers AI Card List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredRecs.map(({ freelancer, matchScore, matchedSkills, missingSkills, rationale }) => (
              <div
                key={freelancer.id}
                onClick={() => navigate(`/client/hire/${freelancer.id}`)}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderLeft: `4px solid ${matchScore >= 90 ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 16, padding: "20px 24px",
                  display: "flex", gap: 20, alignItems: "flex-start",
                  transition: "all 0.25s ease",
                  position: "relative", overflow: "hidden",
                  cursor: "pointer"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(6,182,212,0.12)";
                  e.currentTarget.style.borderColor = "rgba(6,182,212,0.25)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                {/* AI Top Pick Tag */}
                {matchScore >= 90 && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    background: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.1))",
                    border: "1px solid rgba(16,185,129,0.35)",
                    borderRadius: 20, padding: "3px 10px",
                    fontSize: 10, fontWeight: 700, color: "#10b981", letterSpacing: 0.5,
                    display: "flex", alignItems: "center", gap: 5
                  }}>
                    <Sparkles size={10} /> AI TOP PICK
                  </div>
                )}

                {/* Score Progress Ring */}
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <ScoreRing score={matchScore} />
                  <div style={{ fontSize: 9, color: getScoreColor(matchScore), fontWeight: 600, marginTop: 2, whiteSpace: "nowrap" }}>
                    {getScoreLabel(matchScore)}
                  </div>
                </div>

                {/* Profile info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    {/* Mock Avatar */}
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "linear-gradient(135deg,#06b6d4,#6366f1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13, color: "white"
                    }}>
                      {freelancer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        {freelancer.name}
                      </h3>
                    </div>
                    {/* Star Rating */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.03)", padding: "2px 8px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Star size={11} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>{freelancer.rating.toFixed(1)}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>({freelancer.completedJobs})</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
                    {freelancer.bio}
                  </p>

                  {/* Match Rationale */}
                  <div style={{
                    fontSize: 12, color: "#a5b4fc", display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)",
                    borderRadius: 8, padding: "8px 12px", marginBottom: 12
                  }}>
                    <Bot size={13} style={{ color: "#818cf8" }} />
                    <span>{rationale}</span>
                  </div>

                  {/* Matched and missing skills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {matchedSkills.map(s => (
                      <span key={s} style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                        background: "rgba(16,185,129,0.12)", color: "#10b981",
                        border: "1px solid rgba(16,185,129,0.25)"
                      }}>✓ {s}</span>
                    ))}
                    {missingSkills.map(s => (
                      <span key={s} style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                        background: "rgba(255,255,255,0.04)", color: "var(--text-muted)",
                        border: "1px solid rgba(255,255,255,0.08)"
                      }}>{s}</span>
                    ))}
                  </div>

                  {/* Meta stats */}
                  <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                      <DollarSign size={12} style={{ color: "#10b981" }} />
                      <strong style={{ color: "#10b981" }}>${freelancer.hourlyRate}/hr</strong> Rate
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                      <MapPin size={12} /> {freelancer.location}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                      <Award size={12} /> {freelancer.completedJobs} projects completed
                    </span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div style={{ flexShrink: 0, alignSelf: "center" }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}

            {!filteredRecs.length && (
              <div className="card" style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No freelancers found</div>
                <div style={{ fontSize: 13 }}>Try lower matching filters or adjusting your search text.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
