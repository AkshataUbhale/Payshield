import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle, X, Calendar } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";

const SKILL_SUGGESTIONS = ["React", "Node.js", "Solidity", "Python", "Figma", "TypeScript", "Vue", "GraphQL", "AWS", "DevOps"];

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", budget: "", deadline: "", category: "", experience: ""
  });
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [posted, setPosted] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const addSkill = (s) => {
    const sk = s || newSkill.trim();
    if (sk && !skills.includes(sk)) { setSkills(p => [...p, sk]); setNewSkill(""); }
  };
  const removeSkill = (s) => setSkills(skills.filter(x => x !== s));

  const handlePost = () => {
    if (!form.title || !form.budget || !skills.length) {
      alert("Please fill title, budget, and at least one skill."); return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setPosted(true); }, 1200);
  };

  if (posted) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
          <div className="card" style={{ maxWidth: 440, textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>📋</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Job Posted Successfully!</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 28 }}>
              Your job is live on PayShield. Freelancers will start applying shortly.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate("/client/jobs")}>My Jobs</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate("/client/dashboard")}>Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Post a Job</span>
            <span className="topbar-breadcrumb">Find the right freelancer</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={14} /> Back</button>
          </div>
        </div>

        <div className="page-container">
          <div style={{ maxWidth: 700 }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Job Details</h3>

              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input id="input-job-title" className="form-input" placeholder="e.g. React Developer Needed for Dashboard"
                  value={form.title} onChange={set("title")} />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={set("category")}>
                  <option value="">Select category…</option>
                  <option>Web Development</option>
                  <option>Blockchain / Web3</option>
                  <option>UI/UX Design</option>
                  <option>Mobile Development</option>
                  <option>Data Science / AI</option>
                  <option>DevOps / Cloud</option>
                  <option>Content Writing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Description *</label>
                <textarea id="input-job-desc" className="form-textarea" rows={8}
                  placeholder="Describe the work, expectations, deliverables, and any technical requirements…"
                  value={form.description} onChange={set("description")} style={{ minHeight: 200 }} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Budget (USDC) *</label>
                  <div className="input-group">
                    <input id="input-budget" type="number" className="form-input"
                      placeholder="500" value={form.budget} onChange={set("budget")} />
                    <span className="input-suffix">USDC</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline *</label>
                  <div className="input-group">
                    <Calendar className="input-icon" size={15} />
                    <input id="input-deadline" type="date" className="form-input input-with-icon"
                      value={form.deadline} onChange={set("deadline")} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Entry", "Intermediate", "Expert"].map(l => (
                    <button key={l} onClick={() => set("experience")({ target: { value: l } })}
                      style={{
                        flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${form.experience === l ? "var(--accent-purple)" : "var(--border)"}`,
                        background: form.experience === l ? "rgba(99,102,241,0.1)" : "transparent",
                        color: form.experience === l ? "var(--accent-purple)" : "var(--text-muted)",
                        fontSize: 13, fontWeight: 600
                      }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Required Skills *</h3>

              {skills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {skills.map(s => (
                    <div key={s} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
                      borderRadius: 20, padding: "4px 10px 4px 12px",
                      color: "var(--accent-purple)", fontSize: 12, fontWeight: 600
                    }}>
                      {s}
                      <button onClick={() => removeSkill(s)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input className="form-input" placeholder="Type a skill and press Enter…"
                  value={newSkill} onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addSkill()}
                  style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={() => addSkill()}><PlusCircle size={14} /> Add</button>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Suggestions:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)} style={{
                    padding: "4px 10px", borderRadius: 20, border: "1px solid var(--border)",
                    background: "transparent", color: "var(--text-secondary)",
                    fontSize: 11, fontWeight: 600, cursor: "pointer"
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div style={{
              background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 20,
              fontSize: 13, color: "var(--text-secondary)"
            }}>
              🔒 <strong>Escrow Protected</strong> — After hiring, payment is locked in a smart contract until you approve the freelancer's work.
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>Cancel</button>
              <button id="btn-post-job-submit" className="btn btn-primary btn-lg" style={{ flex: 2 }}
                onClick={handlePost} disabled={loading}>
                {loading ? <span className="spinner" /> : <><PlusCircle size={16} /> Post Job</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
