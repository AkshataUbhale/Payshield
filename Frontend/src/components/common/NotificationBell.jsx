import { Bell, X } from "lucide-react";
import { useState } from "react";

const SAMPLE_NOTIFICATIONS = [
  { id: 1, type: "job",      msg: "New job matching your skills: React Developer",     time: "2m ago",  read: false },
  { id: 2, type: "contract", msg: "Escrow contract created for Logo Design Project",   time: "1h ago",  read: false },
  { id: 3, type: "payment",  msg: "Payment of 500 USDC released to your wallet",       time: "3h ago",  read: true  },
  { id: 4, type: "apply",    msg: "Freelancer applied to your Web App Frontend job",   time: "5h ago",  read: true  },
  { id: 5, type: "dispute",  msg: "Dispute opened on Contract #C004",                 time: "1d ago",  read: true  },
];

const TYPE_COLOR = {
  job: "var(--accent-purple)", contract: "var(--accent-blue)",
  payment: "var(--accent-green)", apply: "var(--accent-cyan)", dispute: "var(--accent-red)"
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const unread = notifications.filter(n => !n.read).length;

  const markAll = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const dismiss = (id) => setNotifications(n => n.filter(x => x.id !== id));

  return (
    <div style={{ position: "relative" }}>
      <button
        id="btn-notification-bell"
        onClick={() => setOpen(!open)}
        style={{
          position: "relative", background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border)", borderRadius: 10,
          padding: "8px 10px", cursor: "pointer", color: "var(--text-secondary)"
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            width: 16, height: 16, borderRadius: "50%",
            background: "var(--accent-red)", color: "white",
            fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>{unread}</span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
          {/* Dropdown */}
          <div style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            width: 340, background: "var(--bg-secondary)",
            border: "1px solid var(--border)", borderRadius: 14,
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            zIndex: 200, overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{
              padding: "14px 18px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications {unread > 0 && `(${unread})`}</span>
              <button onClick={markAll} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--accent-purple)", fontSize: 12, fontWeight: 600
              }}>Mark all read</button>
            </div>

            {/* Items */}
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.03)",
                  background: n.read ? "transparent" : "rgba(99,102,241,0.04)",
                  display: "flex", gap: 10, alignItems: "flex-start"
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: TYPE_COLOR[n.type], marginTop: 5,
                    opacity: n.read ? 0.3 : 1
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, 
                      fontWeight: n.read ? 400 : 600 }}>
                      {n.msg}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{n.time}</div>
                  </div>
                  <button onClick={() => dismiss(n.id)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: 2, flexShrink: 0
                  }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
