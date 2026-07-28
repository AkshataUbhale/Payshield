import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Save, Building, Star } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import { useAuth } from "../../hooks/useAuth";

export default function ClientProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const profile = {
    name: user?.name || "Sarah Chen",
    company: user?.companyName || "TechStartup Inc.",
    email: user?.email || "sarah@techstartup.com",
    location: "San Francisco, CA",
    website: "https://techstartup.io",
    bio: "We build cutting-edge SaaS products. Looking for talented developers and designers who deliver quality work on time.",
    totalSpent: "$42,800",
    jobsPosted: 24,
    hiredFreelancers: 18,
    avgRating: 4.8,
  };

  const RECENT_HIRES = [
    { name: "Alex Johnson", role: "React Developer", rating: 5, date: "Mar 2026" },
    { name: "Priya Sharma",  role: "Solidity Dev",    rating: 5, date: "Feb 2026" },
    { name: "Carlos Rivera", role: "UI/UX Designer",  rating: 4, date: "Jan 2026" },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Company Profile</span>
            <span className="topbar-breadcrumb">Your public client profile</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/client/edit-profile")}>
              <Edit size={14} /> Edit Profile
            </button>
          </div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Company card */}
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18, margin: "0 auto 16px",
                  background: "linear-gradient(135deg,#06b6d4,#3b82f6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(6,182,212,0.35)"
                }}>
                  <Building size={32} color="white" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{profile.company}</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{profile.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>📍 {profile.location}</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16, textAlign: "left" }}>
                  {profile.bio}
                </p>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, color: "var(--accent-blue)" }}>{profile.website}</a>
                )}
              </div>

              {/* Stats */}
              <div className="card">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {[
                    { label: "Total Spent",         value: profile.totalSpent,       color: "var(--accent-purple)" },
                    { label: "Jobs Posted",          value: profile.jobsPosted,       color: "var(--accent-blue)" },
                    { label: "Freelancers Hired",    value: profile.hiredFreelancers, color: "var(--accent-green)" },
                    { label: "Avg. Rating Given",    value: `⭐ ${profile.avgRating}`, color: "var(--accent-amber)" },
                  ].map(s => (
                    <div key={s.label} style={{
                      padding: "16px", background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border)", borderRadius: 12, textAlign: "center"
                    }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: recent hires */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent Freelancers Hired</h3>
              {RECENT_HIRES.map(h => (
                <div key={h.name} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 0", borderBottom: "1px solid var(--border)"
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#3b82f6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0
                  }}>
                    {h.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{h.name}</div>
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
