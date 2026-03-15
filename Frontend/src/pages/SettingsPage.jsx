import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Shield, User, Sliders, LogOut, Save } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";

const SECTIONS = ["Profile", "Notifications", "Security", "Preferences"];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [active, setActive] = useState("Profile");
  const [notifs, setNotifs] = useState({
    jobMatches: true, contractUpdates: true, payments: true, disputes: true, marketing: false
  });
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);

  const toggleNotif = (k) => setNotifs(n => ({ ...n, [k]: !n[k] }));

  const handleSave = () => {
    updateUser({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const ICONS = { Profile: User, Notifications: Bell, Security: Shield, Preferences: Sliders };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Settings</span>
            <span className="topbar-breadcrumb">Manage your account preferences</span>
          </div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems: "start", gridTemplateColumns: "200px 1fr" }}>
            {/* Side nav */}
            <div className="card card-sm">
              {SECTIONS.map(s => {
                const Icon = ICONS[s];
                return (
                  <div key={s} onClick={() => setActive(s)}
                    className={`nav-item${active === s ? " active" : ""}`}
                    style={{ marginBottom: 4 }}>
                    <Icon size={15} /> {s}
                  </div>
                );
              })}
              <div className="divider" />
              <div className="nav-item" style={{ color: "var(--accent-red)" }} onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </div>
            </div>

            {/* Content */}
            <div className="card">
              {active === "Profile" && (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profile Settings</h3>
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={user?.email || "demo@payshield.io"} readOnly
                      style={{ opacity: 0.6 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={user?.role || "freelancer"}
                      onChange={e => updateUser({ role: e.target.value })}>
                      <option value="freelancer">Freelancer</option>
                      <option value="client">Client / Employer</option>
                    </select>
                  </div>
                  <button className={`btn ${saved ? "btn-success" : "btn-primary"}`} onClick={handleSave}>
                    {saved ? "✓ Saved!" : <><Save size={14} /> Save Changes</>}
                  </button>
                </>
              )}

              {active === "Notifications" && (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Notification Preferences</h3>
                  {[
                    { k: "jobMatches",      label: "Job Match Alerts",          desc: "When new jobs match your skills" },
                    { k: "contractUpdates", label: "Contract Updates",          desc: "Milestones, status changes, approvals" },
                    { k: "payments",        label: "Payment Notifications",     desc: "When funds are released or received" },
                    { k: "disputes",        label: "Dispute Alerts",            desc: "When a dispute is opened or resolved" },
                    { k: "marketing",       label: "Platform Updates & Tips",   desc: "News, feature announcements" },
                  ].map(item => (
                    <div key={item.k} className="flex-between" style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.desc}</div>
                      </div>
                      <div onClick={() => toggleNotif(item.k)} style={{
                        width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                        background: notifs[item.k] ? "var(--accent-purple)" : "rgba(255,255,255,0.1)",
                        position: "relative", transition: "background 0.2s"
                      }}>
                        <div style={{
                          position: "absolute", top: 3, left: notifs[item.k] ? 23 : 3,
                          width: 18, height: 18, borderRadius: "50%", background: "white",
                          transition: "left 0.2s"
                        }} />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {active === "Security" && (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Security Settings</h3>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input" placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" placeholder="Min 8 characters" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" placeholder="••••••••" />
                  </div>
                  <button className="btn btn-primary"><Save size={14} /> Update Password</button>

                  <div className="divider" />
                  <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)",
                    borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                    🔒 Your wallet signing keys are never stored by PayShield. Only your MetaMask holds them.
                  </div>
                </>
              )}

              {active === "Preferences" && (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>App Preferences</h3>
                  <div className="form-group">
                    <label className="form-label">Display Currency</label>
                    <select className="form-select"><option>USDC</option><option>USD</option><option>EUR</option></select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select className="form-select"><option>English</option><option>Spanish</option><option>Hindi</option></select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select className="form-select">
                      <option>UTC+0 (London)</option>
                      <option>UTC+5:30 (Mumbai)</option>
                      <option>UTC-5 (New York)</option>
                      <option>UTC+1 (Berlin)</option>
                    </select>
                  </div>
                  <button className="btn btn-primary"><Save size={14} /> Save Preferences</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
