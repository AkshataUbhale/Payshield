import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Building2,
  Star,
  Globe,
  Clock,
  CheckCircle,
  Briefcase,
  Layers,
  Shield,
  Mail,
  User,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import * as api from "../../services/api";

export default function ClientProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        if (!token) return;

        const [profileData, contractData] = await Promise.all([
          api.getProfile(token).catch(() => null),
          api.getContracts({}, token).catch(() => []),
        ]);

        if (profileData) setProfile(profileData);
        const list = Array.isArray(contractData)
          ? contractData
          : contractData?.projects || [];
        setContracts(list);
      } catch (err) {
        console.error("Failed to load client profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [publicKey]);

  const p = profile || user || {};

  const displayName = p.displayName || p.fullName || p.name || p.username || "Client";
  const username = p.username || `client_${(p.walletAddress || "").slice(0, 6)}`;
  const company = p.companyName || displayName;
  const email = p.email || "";
  const bio = p.bio || "Active buyer on PayShield funding milestone-based escrow contracts.";
  const avatarUrl = p.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=ClientCorp";
  const industry = p.industry || "Software & Web3 Development";
  const companySize = p.companySize || "2 - 10 employees";
  const buyingCategory = p.buyingCategory || "Primary Job & Business";
  const clientType = p.clientType === "dual_role" ? "Dual-Role (Buyer & Seller)" : "Client / Buyer Only";
  const completeness = p.completenessScore || 80;
  const availabilityWindow = p.availabilityWindow || { timeZone: "UTC", dailyHours: "9:00 AM - 5:00 PM" };
  const languages = Array.isArray(p.languages) && p.languages.length > 0
    ? p.languages
    : [{ language: "English", level: "Fluent" }];

  const totalSpent = contracts.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const jobsPosted = contracts.length;
  const uniqueFreelancers = new Set(contracts.map((c) => c.freelancerPubkey).filter(Boolean)).size;

  const recentHires = contracts
    .filter((c) => c.freelancerPubkey && c.status !== "open")
    .slice(0, 4)
    .map((c) => ({
      id: c.projectId || c._id,
      pubkey: c.freelancerPubkey,
      role: c.title,
      rating: 5,
      date: new Date(c.updatedAt || c.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    }));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Client &amp; Buyer Profile</span>
            <span className="topbar-breadcrumb">Fiverr-style Organization View</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/client/edit-profile")}>
              <Edit size={14} /> Edit Profile
            </button>
          </div>
        </div>

        <div className="page-container">
          {loading ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "4rem" }}>
              Loading company profile...
            </div>
          ) : (
            <div className="grid-2" style={{ alignItems: "start", gap: 24 }}>
              {/* Left Column: Organization Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Main Card */}
                <div className="card" style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--accent-green)",
                    }}
                  >
                    <CheckCircle size={12} /> {completeness}% Complete
                  </div>

                  <div style={{ textAlign: "center", paddingTop: 8 }}>
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 16,
                        margin: "0 auto 14px",
                        border: "2px solid var(--accent-green, #10b981)",
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      <img src={avatarUrl} alt={company} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>{company}</h2>
                    <p style={{ fontSize: 13, color: "var(--accent-green)", fontWeight: 600, margin: "0 0 8px" }}>
                      @{username}
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, color: "#a5b4fc" }}>
                        {clientType}
                      </span>
                      <span style={{ fontSize: 11, padding: "3px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}>
                        {companySize}
                      </span>
                      <span style={{ fontSize: 11, padding: "3px 10px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, color: "var(--accent-green)" }}>
                        {industry}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, textAlign: "left", margin: "0 0 16px" }}>
                      {bio}
                    </p>

                    {/* Stats Strip */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        padding: "12px 0",
                        background: "rgba(255, 255, 255, 0.02)",
                        borderTop: "1px solid var(--border)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-purple)" }}>
                          {totalSpent} USDC
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Funded</div>
                      </div>
                      <div style={{ width: 1, background: "var(--border)" }} />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-blue)" }}>
                          {jobsPosted}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Jobs Posted</div>
                      </div>
                      <div style={{ width: 1, background: "var(--border)" }} />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-green)" }}>
                          {uniqueFreelancers}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Talent Hired</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences & Availability Card */}
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={15} color="var(--accent-green)" /> Working Hours &amp; Preferences
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Time Zone:</span>
                      <span style={{ fontWeight: 600 }}>{availabilityWindow.timeZone}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Daily Hours:</span>
                      <span style={{ fontWeight: 600 }}>{availabilityWindow.dailyHours}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Buying Scope:</span>
                      <span style={{ fontWeight: 600 }}>{buyingCategory}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Languages:</span>
                      <span style={{ fontWeight: 600 }}>{languages.map((l) => l.language || l).join(", ")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Escrow History & Recent Hires */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recently Hired Developers</h3>
                  {recentHires.length === 0 ? (
                    <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem", fontSize: 13 }}>
                      Hired developers and releases will appear here as escrow milestones progress.
                    </div>
                  ) : (
                    recentHires.map((h) => (
                      <div
                        key={h.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 0",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          {h.pubkey.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {h.pubkey.slice(0, 6)}...{h.pubkey.slice(-4)}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{h.role}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            {Array.from({ length: h.rating }).map((_, i) => (
                              <Star key={i} size={11} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                            ))}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{h.date}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
