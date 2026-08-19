import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  User,
  DollarSign,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import * as api from "../../services/api";

const OCCUPATIONS = [
  "Web & Software Development",
  "Blockchain & Smart Contracts",
  "AI & Machine Learning",
  "Design & Creative",
  "Writing & Translation",
  "DevOps & Cloud Architecture",
];

const LANGUAGES_LIST = [
  "English", "Spanish", "French", "German", "Mandarin", "Japanese", "Russian", "Portuguese", "Hindi", "Arabic"
];

const PROFICIENCY_LEVELS = ["Basic", "Conversational", "Fluent", "Native"];

export default function EditFreelancerProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    bio: "",
    hourlyRate: 50,
    avatarUrl: "",
    occupation: "Web & Software Development",
    occupationStartYear: "2021",
    occupationEndYear: "Present",
    personalWebsite: "",
    portfolioUrl: "",
    resumeName: "",
    languages: [{ language: "English", level: "Fluent" }],
    skillsDetail: [
      { name: "React", level: "Expert" },
      { name: "TypeScript", level: "Intermediate" },
      { name: "Solana", level: "Intermediate" },
    ],
    education: [
      { country: "United States", university: "Stanford University", title: "B.Sc", major: "Computer Science", year: "2023" }
    ],
    certifications: [
      { name: "Solana Core Developer Certification", issuer: "Solana Foundation", year: "2024" }
    ],
  });

  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLiveProfile() {
      try {
        const token = sessionStorage.getItem("ps_token");
        if (token) {
          const p = await api.getProfile(token);
          if (p) {
            setForm({
              firstName: p.firstName || (p.fullName ? p.fullName.split(" ")[0] : ""),
              lastName: p.lastName || (p.fullName ? p.fullName.split(" ").slice(1).join(" ") : ""),
              displayName: p.displayName || p.fullName || p.name || p.username || "",
              bio: p.bio || "",
              hourlyRate: p.hourlyRate || 50,
              avatarUrl: p.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
              occupation: p.occupation || "Web & Software Development",
              occupationStartYear: p.occupationStartYear || "2021",
              occupationEndYear: p.occupationEndYear || "Present",
              personalWebsite: p.personalWebsite || "",
              portfolioUrl: p.portfolioUrl || (p.portfolioLinks && p.portfolioLinks[0]) || "",
              resumeName: p.resumeName || "",
              languages: Array.isArray(p.languages) && p.languages.length > 0 ? p.languages : [{ language: "English", level: "Fluent" }],
              skillsDetail: Array.isArray(p.skillsDetail) && p.skillsDetail.length > 0
                ? p.skillsDetail
                : (p.skills || []).map((s) => ({ name: s, level: "Intermediate" })),
              education: Array.isArray(p.education) && p.education.length > 0 ? p.education : [],
              certifications: Array.isArray(p.certifications) && p.certifications.length > 0 ? p.certifications : [],
            });
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadLiveProfile();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const val = newSkill.trim();
    if (form.skillsDetail.some((s) => s.name.toLowerCase() === val.toLowerCase())) return;
    setForm((prev) => ({
      ...prev,
      skillsDetail: [...prev.skillsDetail, { name: val, level: newSkillLevel }],
    }));
    setNewSkill("");
  };

  const removeSkill = (name) => {
    setForm((prev) => ({
      ...prev,
      skillsDetail: prev.skillsDetail.filter((s) => s.name !== name),
    }));
  };

  const addLanguage = () => {
    setForm((prev) => ({
      ...prev,
      languages: [...prev.languages, { language: "Spanish", level: "Conversational" }],
    }));
  };

  const removeLanguage = (idx) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== idx),
    }));
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [...prev.education, { country: "United States", university: "", title: "B.Sc", major: "", year: "2024" }],
    }));
  };

  const removeEducation = (idx) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx),
    }));
  };

  const addCertification = () => {
    setForm((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", issuer: "", year: "2024" }],
    }));
  };

  const removeCertification = (idx) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const token = sessionStorage.getItem("ps_token");
      const flatSkills = form.skillsDetail.map((s) => s.name);
      const fullName = `${form.firstName} ${form.lastName}`.trim() || form.displayName;

      const payload = {
        ...form,
        fullName,
        displayName: form.displayName,
        skills: flatSkills,
        hourlyRate: Number(form.hourlyRate) || 50,
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
            <span className="topbar-title">Edit Seller Profile</span>
            <span className="topbar-breadcrumb">Update Fiverr-style credentials and details</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/freelancer/profile")}>
              <ArrowLeft size={14} /> Back to Profile
            </button>
          </div>
        </div>

        <div className="page-container">
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#fca5a5",
                  fontSize: 13,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Basic & Public Info */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Personal &amp; Public Identity</h3>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <img
                  src={form.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=Felix"}
                  alt="Avatar"
                  style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid var(--accent-purple)", objectFit: "cover" }}
                />
                <div>
                  <label htmlFor="edit-avatar" className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <Upload size={13} /> Change Photo
                  </label>
                  <input id="edit-avatar" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                </div>
              </div>

              <div className="grid-2 mb-4">
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    First &amp; Last Name
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="form-input"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      style={{ width: "50%" }}
                    />
                    <input
                      className="form-input"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Display Name (Public)
                  </label>
                  <input
                    className="form-input"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                  Description / Bio (150–600 chars)
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Occupation
                  </label>
                  <select
                    className="form-input"
                    value={form.occupation}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {OCCUPATIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Hourly Rate (USDC)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Skills Tag Editor */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Skills &amp; Proficiency Tags</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {form.skillsDetail.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(99, 102, 241, 0.12)",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      borderRadius: 20,
                      padding: "4px 10px 4px 12px",
                      color: "#a5b4fc",
                      fontSize: 12,
                    }}
                  >
                    <strong>{s.name}</strong> ({s.level})
                    <button
                      type="button"
                      onClick={() => removeSkill(s.name)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Add skill tag (e.g. Anchor, Rust)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  style={{ flex: 2 }}
                />
                <select
                  className="form-input"
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <button type="button" className="btn btn-secondary" onClick={addSkill}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* 3. Languages */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Languages</h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addLanguage}>
                  <Plus size={13} /> Add Language
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {form.languages.map((lang, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <select
                      className="form-input"
                      value={lang.language}
                      onChange={(e) => {
                        const updated = [...form.languages];
                        updated[idx].language = e.target.value;
                        setForm({ ...form, languages: updated });
                      }}
                      style={{ flex: 1 }}
                    >
                      {LANGUAGES_LIST.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select
                      className="form-input"
                      value={lang.level}
                      onChange={(e) => {
                        const updated = [...form.languages];
                        updated[idx].level = e.target.value;
                        setForm({ ...form, languages: updated });
                      }}
                      style={{ flex: 1 }}
                    >
                      {PROFICIENCY_LEVELS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {form.languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(idx)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 6 }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Education & Certifications */}
            <div className="grid-2 mb-6">
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Education</h3>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addEducation}>+ Add</button>
                </div>
                {form.education.map((edu, idx) => (
                  <div key={idx} style={{ padding: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 8 }}>
                    <input
                      className="form-input"
                      placeholder="University"
                      value={edu.university}
                      onChange={(e) => {
                        const updated = [...form.education];
                        updated[idx].university = e.target.value;
                        setForm({ ...form, education: updated });
                      }}
                      style={{ marginBottom: 6, fontSize: 12 }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        className="form-input"
                        placeholder="Major"
                        value={edu.major}
                        onChange={(e) => {
                          const updated = [...form.education];
                          updated[idx].major = e.target.value;
                          setForm({ ...form, education: updated });
                        }}
                        style={{ flex: 1, fontSize: 12 }}
                      />
                      <input
                        className="form-input"
                        placeholder="Year"
                        value={edu.year}
                        onChange={(e) => {
                          const updated = [...form.education];
                          updated[idx].year = e.target.value;
                          setForm({ ...form, education: updated });
                        }}
                        style={{ width: 70, fontSize: 12 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Certifications</h3>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addCertification}>+ Add</button>
                </div>
                {form.certifications.map((cert, idx) => (
                  <div key={idx} style={{ padding: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 8 }}>
                    <input
                      className="form-input"
                      placeholder="Certificate Name"
                      value={cert.name}
                      onChange={(e) => {
                        const updated = [...form.certifications];
                        updated[idx].name = e.target.value;
                        setForm({ ...form, certifications: updated });
                      }}
                      style={{ marginBottom: 6, fontSize: 12 }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        className="form-input"
                        placeholder="Issuer (e.g. Solana Foundation)"
                        value={cert.issuer}
                        onChange={(e) => {
                          const updated = [...form.certifications];
                          updated[idx].issuer = e.target.value;
                          setForm({ ...form, certifications: updated });
                        }}
                        style={{ flex: 1, fontSize: 12 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeCertification(idx)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate("/freelancer/profile")}>
                Cancel
              </button>
              <button
                id="btn-save-freelancer-profile"
                type="button"
                className={`btn ${saved ? "btn-success" : "btn-primary"}`}
                style={{ flex: 2 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : saved ? "✓ Profile Updated!" : <><Save size={14} /> Save Profile</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
