import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Briefcase, Users, Wallet,
  Bell, Settings, LogOut, Shield, ChevronRight,
  PlusCircle, Search, Send, Star, History, AlertTriangle, User
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";

const FREELANCER_NAV = [
  {
    section: "MAIN",
    items: [
      { label: "Dashboard",    icon: LayoutDashboard, to: "/freelancer/dashboard" },
      { label: "Browse Jobs",  icon: Search,          to: "/freelancer/jobs" },
      { label: "My Contracts", icon: FileText,        to: "/freelancer/contracts" },
      { label: "Submit Work",  icon: Send,            to: "/submit" },
    ]
  },
  {
    section: "EARNINGS",
    items: [
      { label: "Payments",     icon: Wallet,          to: "/freelancer/payments" },
      { label: "Wallet",       icon: Wallet,          to: "/wallet" },
      { label: "Transactions", icon: History,         to: "/transactions" },
    ]
  },
  {
    section: "PROFILE",
    items: [
      { label: "My Profile",   icon: User,            to: "/freelancer/profile" },
      { label: "Reviews",      icon: Star,            to: "/freelancer/reviews" },
      { label: "Disputes",     icon: AlertTriangle,   to: "/dispute" },
    ]
  },
];

const CLIENT_NAV = [
  {
    section: "MAIN",
    items: [
      { label: "Dashboard",        icon: LayoutDashboard, to: "/client/dashboard" },
      { label: "Post a Job",       icon: PlusCircle,      to: "/client/post-job" },
      { label: "My Jobs",          icon: Briefcase,       to: "/client/jobs" },
      { label: "Hire Freelancer",  icon: Users,           to: "/client/freelancers" },
    ]
  },
  {
    section: "CONTRACTS",
    items: [
      { label: "Contracts",        icon: FileText,        to: "/contracts" },
      { label: "Create Escrow",    icon: Shield,          to: "/create" },
      { label: "Approve Work",     icon: FileText,        to: "/approve" },
    ]
  },
  {
    section: "ACCOUNT",
    items: [
      { label: "Wallet",           icon: Wallet,          to: "/wallet" },
      { label: "Transactions",     icon: History,         to: "/transactions" },
      { label: "Disputes",         icon: AlertTriangle,   to: "/dispute" },
      { label: "My Profile",       icon: User,            to: "/client/profile" },
    ]
  },
];

export default function Sidebar({ walletAddress }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { shortAddr, connected } = useWallet();

  const role = user?.role || "freelancer";
  const navGroups = role === "client" ? CLIENT_NAV : FREELANCER_NAV;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayAddr = shortAddr || (walletAddress
    ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}`
    : null);

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)"
          }}>
            <Shield size={16} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">PayShield</div>
          </div>
        </div>
        <div className="sidebar-logo-badge" style={{ marginTop: 6 }}>
          {role === "client" ? "CLIENT PORTAL" : "FREELANCER PORTAL"}
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navGroups.map(group => (
          <div key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map(item => (
              <div
                key={item.to}
                className={`nav-item${isActive(item.to) ? " active" : ""}`}
                onClick={() => navigate(item.to)}
              >
                <item.icon size={16} className="nav-icon" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive(item.to) && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Wallet status */}
        {displayAddr && (
          <div className="wallet-badge" style={{ marginBottom: 12 }} onClick={() => navigate("/wallet")}>
            <div className="wallet-dot" />
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: 12 }}>{displayAddr}</span>
          </div>
        )}

        {/* User */}
        {user && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, marginBottom: 4,
            background: "rgba(255,255,255,0.03)"
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0
            }}>
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", truncate: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {role}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <div
            className="nav-item"
            style={{ flex: 1 }}
            onClick={() => navigate("/settings")}
          >
            <Settings size={14} /> Settings
          </div>
          <div
            className="nav-item"
            style={{ flex: 1, color: "var(--accent-red)" }}
            onClick={handleLogout}
          >
            <LogOut size={14} /> Logout
          </div>
        </div>
      </div>
    </div>
  );
}
