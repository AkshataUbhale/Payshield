import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import * as api from "../../services/api";

export default function EditFreelancerProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || user?.username || "",
    bio: user?.bio || "",
    hourlyRate: user?.hourlyRate ? String(user.hourlyRate) : "",
    experience: user?.experience || "",
    location: user?.location || "",
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLiveProfile() {
      try {
        const token = sessionStorage.getItem("ps_token");
        if (token) {
          const profile = await api.getProfile(token);
          if (profile) {
            setForm({
              name: profile.name || profile.username || "",
              bio: profile.bio || "",
              hourlyRate: profile.hourlyRate ? String(profile.hourlyRate) : "",
              experience: profile.experience || "",
              location: profile.location || "",
            });
            setSkills(profile.skills || []);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadLiveProfile();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((s) => [...s, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const token = sessionStorage.getItem("ps_token");
      const payload = {
        name: form.name,
        bio: form.bio,
        hourlyRate: Number(form.hourlyRate) || 0,
        experience: form.experience,
        location: form.location,
        skills,
      };

      if (token) {
        await api.updateProfile(payload, token);
      }
      updateUser(payload);
      setSaved(true);
      setTimeout(() => {
        navigate("/freelancer/profile");
      }, 500);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Edit Profile</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        <div className="page-container">
          <div style={{ maxWidth: 680 }}>
            {error && <div className="alert alert-error mb-4">{error}</div>}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Basic Information</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name / Handle</label>
                  <input className="form-input" value={form.name} onChange={set("name")} placeholder="Your full name or alias" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="City, Country" value={form.location} onChange={set("location")} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio / About</label>
                <textarea className="form-textarea" rows={4} value={form.bio} onChange={set("bio")} placeholder="Describe your technical background and expertise..." />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Hourly Rate (USDC)</label>
                  <input className="form-input" type="number" value={form.hourlyRate} onChange={set("hourlyRate")} placeholder="e.g. 50" />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input className="form-input" placeholder="e.g. 3 years" value={form.experience} onChange={set("experience")} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Skills</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {skills.length === 0 ? (
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>No skills added yet. Type below to add.</span>
                ) : (
                  skills.map((s) => (
                    <div
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        borderRadius: 20,
                        padding: "4px 10px 4px 12px",
                        color: "var(--accent-purple)",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {s}
                      <button
                        onClick={() => removeSkill(s)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Add skill (e.g. Solana, Rust, React)…"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary" onClick={addSkill}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button
                id="btn-save-freelancer-profile"
                className={`btn ${saved ? "btn-success" : "btn-primary"}`}
                style={{ flex: 2 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : saved ? "✓ Saved!" : <><Save size={14} /> Save Profile</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
