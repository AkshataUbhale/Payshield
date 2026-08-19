import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import * as api from "../../services/api";
import { Bot, ChevronRight, Search } from "lucide-react";

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
    >
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
              background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)"
            }}>
              ✓ {s}
            </span>
          ))}
          {missingSkills.map(s => (
            <span key={s} style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500,
              background: "rgba(255,255,255,0.04)", color: "var(--text-muted)"
            }}>
              {s}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex-between" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          <span style={{ fontWeight: 700, color: "var(--accent-green)", fontSize: 14 }}>
            {project.budget} USDC
          </span>
          <span>{project.deadline ? `Due ${new Date(project.deadline).toLocaleDateString()}` : "Ongoing"}</span>
        </div>
      </div>

      <button
        className="btn btn-secondary btn-sm"
        onClick={e => {
          e.stopPropagation();
          onApply(project);
        }}
      >
        Apply <ChevronRight size={13} />
      </button>
    </div>
  );
}

// ── Job Recommendation Scoring Algorithm ──────────────────────────────────────
function calculateJobMatchScore(project, freelancerSkills = []) {
  const title = project.title || "";
  const desc = project.description || "";
  const projectSkills = project.skills || [];
  
  const matchedSkills = projectSkills.filter(skill =>
    freelancerSkills.some(fs => fs.toLowerCase() === skill.toLowerCase())
  );
  const missingSkills = projectSkills.filter(skill =>
    !freelancerSkills.some(fs => fs.toLowerCase() === skill.toLowerCase())
  );
  
  const skillScore = projectSkills.length > 0 
    ? Math.round((matchedSkills.length / projectSkills.length) * 100) 
    : 80;

  const matchScore = Math.min(100, Math.max(30, skillScore));

  return {
    matchScore,
    category: project.category || "Web3",
    matchedSkills,
    missingSkills,
  };
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AIRecommendations() {
  const navigate = useNavigate();
  const [userSkills, setUserSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [filterMin, setFilterMin] = useState(0);
  const [search, setSearch] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserSkillsAndJobs() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        let skills = [];
        if (token) {
          try {
            const profile = await api.getProfile(token);
            if (profile?.skills && profile.skills.length > 0) {
              skills = profile.skills;
              setUserSkills(skills);
              setSkillInput(skills.join(", "));
            }
          } catch {}
        }

        const openRes = await api.getOpenProjects(token);
        const openProjects = Array.isArray(openRes) ? openRes : [];

        const recs = openProjects.map(project => {
          const scoreData = calculateJobMatchScore(project, skills.length > 0 ? skills : userSkills);
          return {
            project: {
              id: project.projectId || project._id,
              title: project.title,
              description: project.description,
              budget: project.budget,
              deadline: project.deadline,
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
      } finally {
        setLoading(false);
      }
    }
    loadUserSkillsAndJobs();
  }, []);

  const handleSaveSkills = async () => {
    const parsed = skillInput.split(",").map(s => s.trim()).filter(Boolean);
    setUserSkills(parsed);
    setEditMode(false);

    // Re-score recommendations against new skills
    setRecommendations(prev => {
      const updated = prev.map(rec => ({
        ...rec,
        ...calculateJobMatchScore(rec.project, parsed)
      }));
      updated.sort((a, b) => b.matchScore - a.matchScore);
      return updated;
    });

    const token = sessionStorage.getItem("ps_token");
    if (token) {
      try {
        await api.updateProfile({ skills: parsed }, token);
      } catch {}
    }
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
            <span className="topbar-breadcrumb">Ranked by your verified skills match</span>
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
                <span>AI Skill Match Engine</span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                  background: "rgba(99,102,241,0.15)", color: "#a5b4fc"
                }}>ACTIVE</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px" }}>
                Jobs are parsed and ranked against your custom profile skills.
              </p>
              {editMode ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    className="form-input"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    placeholder="React, TypeScript, Solana, Anchor, Rust..."
                    style={{ flex: 1, minWidth: 200, fontSize: 13, height: 38 }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleSaveSkills}>
                    Save & Recalibrate ✦
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {userSkills.length === 0 ? (
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>No skills listed yet.</span>
                  ) : (
                    userSkills.map(s => (
                      <span key={s} style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                        background: "rgba(99,102,241,0.12)", color: "var(--accent-purple)",
                        border: "1px solid rgba(99,102,241,0.2)"
                      }}>
                        {s}
                      </span>
                    ))
                  )}
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
            Showing <strong style={{ color: "var(--text-primary)", margin: "0 4px" }}>{filteredRecs.length}</strong> open Solana contracts
          </div>

          {/* Job Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                <span className="spinner" /> Analyzing open jobs...
              </div>
            ) : filteredRecs.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No open jobs found</div>
                <div style={{ fontSize: 13 }}>Post a job from the Client dashboard to see live recommendations.</div>
              </div>
            ) : (
              filteredRecs.map(rec => (
                <AIJobCard
                  key={rec.project.id} 
                  recommendation={rec}
                  onClick={() => navigate(`/job/${rec.project.id}`)}
                  onApply={j => navigate(`/apply/${j.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
