import { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import Sidebar from "../components/Sidebar";
import * as api from "../services/api";

const TYPE_COLOR = {
  job: "var(--accent-purple)", contract: "var(--accent-blue)",
  payment: "var(--accent-green)", apply: "var(--accent-cyan)", dispute: "var(--accent-red)"
};
const TYPE_LABEL = { job: "Job Alert", contract: "Contract", payment: "Payment", apply: "Application", dispute: "Dispute" };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        if (!token) { setLoading(false); return; }

        // Build notifications from real contract events
        const res = await api.getContracts({}, token);
        const contracts = Array.isArray(res) ? res : res.projects || res.contracts || [];

        const derived = [];
        contracts.forEach((c, idx) => {
          if (c.status === "completed") {
            derived.push({
              id: `payment-${c.projectId || c._id}`,
              type: "payment",
              msg: `Payment released for "${c.title}" — ${c.budget} USDC on-chain`,
              time: new Date(c.updatedAt || c.createdAt).toLocaleDateString(),
              read: true,
            });
          }
          if (c.status === "in_progress") {
            derived.push({
              id: `contract-${c.projectId || c._id}`,
              type: "contract",
              msg: `Escrow contract active: "${c.title}" (${c.budget} USDC locked)`,
              time: new Date(c.createdAt).toLocaleDateString(),
              read: true,
            });
          }
          if (c.status === "open" && (c.proposals || []).length > 0) {
            derived.push({
              id: `apply-${c.projectId || c._id}`,
              type: "apply",
              msg: `${c.proposals.length} freelancer(s) applied to "${c.title}"`,
              time: new Date(c.createdAt).toLocaleDateString(),
              read: false,
            });
          }
          if (c.status === "disputed") {
            derived.push({
              id: `dispute-${c.projectId || c._id}`,
              type: "dispute",
              msg: `Dispute opened on contract: "${c.title}"`,
              time: new Date(c.updatedAt || c.createdAt).toLocaleDateString(),
              read: false,
            });
          }
        });

        setNotifs(derived);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifs([]);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const dismiss = (id) => setNotifs(n => n.filter(x => x.id !== id));
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  const filtered = notifs.filter(n =>
    filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter
  );
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Notifications</span>
            <span className="topbar-breadcrumb">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</span>
          </div>
          <div className="topbar-right">
            {unreadCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={markAll}>
                <Check size={13} /> Mark All Read
              </button>
            )}
          </div>
        </div>

        <div className="page-container">
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {[["all","All"],["unread","Unread"],["job","Job Alerts"],["payment","Payments"],["contract","Contracts"],["dispute","Disputes"],["apply","Applications"]].map(([k,l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                border: `1px solid ${filter === k ? "var(--accent-purple)" : "var(--border)"}`,
                background: filter === k ? "rgba(99,102,241,0.1)" : "transparent",
                color: filter === k ? "var(--accent-purple)" : "var(--text-secondary)",
                fontSize: 12, fontWeight: 600
              }}>{l}</button>
            ))}
          </div>

          {/* Notification list */}
          {loading ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              Loading notifications...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(n => (
                <div key={n.id} style={{
                  background: n.read ? "var(--bg-card)" : "rgba(99,102,241,0.05)",
                  border: `1px solid ${n.read ? "var(--border)" : "rgba(99,102,241,0.2)"}`,
                  borderRadius: 12, padding: "16px 20px",
                  display: "flex", gap: 14, alignItems: "flex-start",
                  transition: "all 0.2s ease"
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                    background: TYPE_COLOR[n.type], opacity: n.read ? 0.3 : 1
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                        color: TYPE_COLOR[n.type],
                        background: `${TYPE_COLOR[n.type]}18`,
                        padding: "2px 8px", borderRadius: 20
                      }}>{TYPE_LABEL[n.type]}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize: 14, color: n.read ? "var(--text-secondary)" : "var(--text-primary)",
                      fontWeight: n.read ? 400 : 500, lineHeight: 1.5 }}>
                      {n.msg}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} title="Mark read"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-green)", padding: 4 }}>
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => dismiss(n.id)} title="Dismiss"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {!filtered.length && (
                <div className="card" style={{ textAlign: "center", padding: "60px 0" }}>
                  <Bell size={32} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No notifications</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Activity from your contracts and jobs will appear here.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
