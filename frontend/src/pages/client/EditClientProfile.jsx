import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import * as api from "../../services/api";

export default function EditClientProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || user?.username || "",
    company: user?.companyName || "",
    email: user?.email || "",
    location: user?.location || "",
    website: user?.website || "",
    bio: user?.bio || "",
  });
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
              company: profile.companyName || "",
              email: profile.email || "",
              location: profile.location || "",
              website: profile.website || "",
              bio: profile.bio || "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load client profile:", err);
      }
    }
    loadLiveProfile();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const token = sessionStorage.getItem("ps_token");
      const payload = {
        name: form.name,
        companyName: form.company,
        email: form.email,
        location: form.location,
        website: form.website,
        bio: form.bio,
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
            <span className="topbar-title">Edit Company Profile</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        <div className="page-container">
          <div style={{ maxWidth: 640 }}>
            {error && <div className="alert alert-error mb-4">{error}</div>}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Company Information</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Contact Name / Representative</label>
                  <input className="form-input" value={form.name} onChange={set("name")} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-input" value={form.company} onChange={set("company")} placeholder="e.g. Acme Labs" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={form.location} onChange={set("location")} placeholder="e.g. San Francisco, CA" />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-input" placeholder="https://..." value={form.website} onChange={set("website")} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Company Bio</label>
                <textarea className="form-textarea" rows={4} value={form.bio} onChange={set("bio")} placeholder="Describe your organization and project vision..." />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button
                id="btn-save-client-profile"
                className={`btn ${saved ? "btn-success" : "btn-primary"}`}
                style={{ flex: 2 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : saved ? "✓ Saved!" : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
