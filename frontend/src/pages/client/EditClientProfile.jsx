import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  Building2,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  User,
  Shield,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import * as api from "../../services/api";

const BUYING_CATEGORIES = [
  "Primary Job & Business",
  "Secondary Business / Side Hustle",
  "Non-Business / Personal Needs",
];

const COMPANY_SIZES = ["Solo / Individual", "2 - 10 employees", "11 - 50 employees", "51+ Enterprise"];

const INDUSTRY_SECTORS = [
  "Software & Web3 Development",
  "E-commerce & Retail",
  "Fintech & Decentralized Finance (DeFi)",
  "Artificial Intelligence & Data",
  "Media & Entertainment",
  "Healthcare & Biotech",
  "Real Estate",
  "Other",
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Mandarin", "Japanese", "Portuguese", "Hindi"];

const TIME_ZONES = [
  "UTC (Coordinated Universal Time)",
  "EST (Eastern Standard Time / New York)",
  "PST (Pacific Standard Time / San Francisco)",
  "GMT (Greenwich Mean Time / London)",
  "CET (Central European Time / Berlin)",
  "IST (Indian Standard Time / Mumbai)",
  "SGT (Singapore Time / Asia)",
];

const DAILY_HOURS = [
  "9:00 AM - 5:00 PM (Standard Business Hours)",
  "8:00 AM - 4:00 PM (Early Shift)",
  "12:00 PM - 8:00 PM (Late Shift)",
  "Flexible / Asynchronous",
  "24/7 Global Team Coverage",
];

export default function EditClientProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    username: "",
    displayName: "",
    clientType: "client_only",
    buyingCategory: "Primary Job & Business",
    companyName: "",
    companySize: "2 - 10 employees",
    industry: "Software & Web3 Development",
    avatarUrl: "",
    bio: "",
    preferredLanguages: ["English"],
    timeZone: "EST (Eastern Standard Time / New York)",
    dailyHours: "9:00 AM - 5:00 PM (Standard Business Hours)",
  });

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
              email: p.email || "",
              username: p.username || "",
              displayName: p.displayName || p.fullName || p.name || "",
              clientType: p.clientType || "client_only",
              buyingCategory: p.buyingCategory || "Primary Job & Business",
              companyName: p.companyName || "",
              companySize: p.companySize || "2 - 10 employees",
              industry: p.industry || "Software & Web3 Development",
              avatarUrl: p.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=ClientCorp",
              bio: p.bio || "",
              preferredLanguages: Array.isArray(p.languages) && p.languages.length > 0
                ? p.languages.map((l) => l.language || l)
                : ["English"],
              timeZone: p.availabilityWindow?.timeZone || "EST (Eastern Standard Time / New York)",
              dailyHours: p.availabilityWindow?.dailyHours || "9:00 AM - 5:00 PM (Standard Business Hours)",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load client profile:", err);
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

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const token = sessionStorage.getItem("ps_token");
      const payload = {
        email: form.email,
        username: form.username,
        displayName: form.displayName,
        fullName: form.displayName,
        companyName: form.companyName,
        companySize: form.companySize,
        industry: form.industry,
        buyingCategory: form.buyingCategory,
        clientType: form.clientType,
        avatarUrl: form.avatarUrl,
        bio: form.bio,
        languages: form.preferredLanguages.map((l) => ({ language: l, level: "Fluent" })),
        availabilityWindow: {
          timeZone: form.timeZone,
          dailyHours: form.dailyHours,
        },
      };

      if (token) {
        await api.updateProfile(payload, token);
      }
      updateUser(payload);
      setSaved(true);
      setTimeout(() => {
        navigate("/client/profile");
      }, 500);
    } catch (err) {
      console.error("Failed to save client profile:", err);
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
            <span className="topbar-title">Edit Buyer / Client Profile</span>
            <span className="topbar-breadcrumb">Update organization branding and preferences</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/client/profile")}>
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

            {/* 1. Account Identity & Logo */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Organization &amp; Identity</h3>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <img
                  src={form.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=ClientCorp"}
                  alt="Logo"
                  style={{ width: 68, height: 68, borderRadius: 12, border: "2px solid var(--accent-green)", objectFit: "cover" }}
                />
                <div>
                  <label htmlFor="edit-client-avatar" className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <Upload size={13} /> Change Brand Logo
                  </label>
                  <input id="edit-client-avatar" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                </div>
              </div>

              <div className="grid-2 mb-4">
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Display Name (Organization / Individual)
                  </label>
                  <input
                    className="form-input"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="e.g. Acme Labs"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Username (@handle)
                  </label>
                  <input
                    className="form-input"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    placeholder="e.g. acme_labs"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                  Email Address (Private for escrow notifications)
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@acme.com"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                  About Me &amp; Hiring Goals
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Describe your organization vision, tech stack, and hiring requirements..."
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>
            </div>

            {/* 2. Demographics & Client Type */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Business Demographics &amp; Persona</h3>

              <div className="grid-2 mb-4">
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Client Type
                  </label>
                  <select
                    className="form-input"
                    value={form.clientType}
                    onChange={(e) => setForm({ ...form, clientType: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="client_only">Client / Buyer Only</option>
                    <option value="dual_role">Dual-Role (Buyer &amp; Seller)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Buying Category
                  </label>
                  <select
                    className="form-input"
                    value={form.buyingCategory}
                    onChange={(e) => setForm({ ...form, buyingCategory: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {BUYING_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Company Size
                  </label>
                  <select
                    className="form-input"
                    value={form.companySize}
                    onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Industry Sector
                  </label>
                  <select
                    className="form-input"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {INDUSTRY_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Preferences & Availability */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Working Hours &amp; Preferences</h3>

              <div className="grid-2 mb-4">
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Primary Time Zone
                  </label>
                  <select
                    className="form-input"
                    value={form.timeZone}
                    onChange={(e) => setForm({ ...form, timeZone: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {TIME_ZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Daily Business Hours
                  </label>
                  <select
                    className="form-input"
                    value={form.dailyHours}
                    onChange={(e) => setForm({ ...form, dailyHours: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {DAILY_HOURS.map((hr) => <option key={hr} value={hr}>{hr}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "block" }}>
                  Preferred Communication Languages
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                  {LANGUAGES.map((lang) => {
                    const isChecked = form.preferredLanguages.includes(lang);
                    return (
                      <label
                        key={lang}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 10px",
                          background: isChecked ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.02)",
                          border: isChecked ? "1px solid var(--accent-green)" : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 12,
                          color: isChecked ? "#ffffff" : "var(--text-secondary)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, preferredLanguages: [...form.preferredLanguages, lang] });
                            } else {
                              setForm({ ...form, preferredLanguages: form.preferredLanguages.filter((l) => l !== lang) });
                            }
                          }}
                        />
                        <span>{lang}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate("/client/profile")}>
                Cancel
              </button>
              <button
                id="btn-save-client-profile"
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
