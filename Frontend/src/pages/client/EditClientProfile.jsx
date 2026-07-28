import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";

export default function EditClientProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    company: user?.companyName || "TechStartup Inc.",
    email: user?.email || "",
    location: "San Francisco, CA",
    website: "https://techstartup.io",
    bio: "We build cutting-edge SaaS products.",
  });
  const [saved, setSaved] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    updateUser({ name: form.name, companyName: form.company });
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate("/client/profile"); }, 1000);
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
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={14}/> Back</button>
          </div>
        </div>

        <div className="page-container">
          <div style={{ maxWidth: 640 }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Company Information</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Contact Name</label>
                  <input className="form-input" value={form.name} onChange={set("name")} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-input" value={form.company} onChange={set("company")} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={form.location} onChange={set("location")} />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-input" placeholder="https://..." value={form.website} onChange={set("website")} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Company Bio</label>
                <textarea className="form-textarea" rows={4} value={form.bio} onChange={set("bio")} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>Cancel</button>
              <button id="btn-save-client-profile" className={`btn ${saved ? "btn-success" : "btn-primary"}`}
                style={{ flex: 2 }} onClick={handleSave}>
                {saved ? "✓ Saved!" : <><Save size={14}/> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
