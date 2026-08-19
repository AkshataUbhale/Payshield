import { Bell, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import * as api from "../../services/api";
import { useWallet } from "../../hooks/useWallet";

const TYPE_COLOR = {
  job: "var(--accent-purple)",
  contract: "var(--accent-blue)",
  payment: "var(--accent-green)",
  apply: "var(--accent-cyan)",
  dispute: "var(--accent-red)",
};

export default function NotificationBell() {
  const { publicKey } = useWallet();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const token = sessionStorage.getItem("ps_token");
        const res = await api.getContracts({}, token);
        const contracts = Array.isArray(res) ? res : res.contracts || [];

        const notifs = [];
        contracts.forEach((c) => {
          if (c.status === "open") {
            notifs.push({
              id: `job-${c.projectId || c._id}`,
              type: "job",
              msg: `New open job: "${c.title}" (${c.budget} USDC)`,
              time: new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              read: false,
            });
          }
          if (c.status === "in_progress") {
            notifs.push({
              id: `contract-${c.projectId || c._id}`,
              type: "contract",
              msg: `Escrow PDA active for "${c.title}"`,
              time: new Date(c.updatedAt || c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              read: true,
            });
          }
          if (c.status === "completed") {
            notifs.push({
              id: `payout-${c.projectId || c._id}`,
              type: "payment",
              msg: `Milestone payment released for "${c.title}"`,
              time: new Date(c.updatedAt || c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              read: true,
            });
          }
        });

        setNotifications(notifs.slice(0, 8));
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    loadNotifications();
  }, [publicKey]);

  const unread = notifications.filter((n) => !n.read).length;
  const markAll = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  const dismiss = (id) => setNotifications((n) => n.filter((x) => x.id !== id));

  return (
    <div style={{ position: "relative" }}>
      <button
        id="btn-notification-bell"
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "8px 10px",
          cursor: "pointer",
          color: "var(--text-secondary)",
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "var(--accent-red)",
              color: "white",
              fontSize: 9,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 340,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              zIndex: 200,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                {unread > 0 && <span className="badge badge-purple">{unread} new</span>}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAll}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    color: "var(--accent-purple)",
                    fontWeight: 600,
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  No recent notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 16px",
                      background: n.read ? "transparent" : "rgba(99,102,241,0.05)",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: TYPE_COLOR[n.type] || "var(--accent-purple)",
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 3 }}>
                        {n.msg}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{n.time}</div>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: 0,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
