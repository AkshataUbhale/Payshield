import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Edit,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Link as LinkIcon,
  FileText,
  ShieldCheck,
  CheckCircle,
  Mail,
  Phone,
  Clock,
  Sparkles,
  ExternalLink,
  Download,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import SkillTag from "../../components/freelancers/SkillTag";
import EarningsChart from "../../components/dashboard/EarningsChart";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import * as api from "../../services/api";

export default function FreelancerProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const [contracts, setContracts] = useState([]);
  const [profile, setProfile] = useState(null);
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
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [publicKey]);

  const p = profile || user || {};

  const displayName = p.displayName || p.fullName || p.name || p.username || "Freelancer";
  const fullName = p.fullName || p.name || displayName;
  const bio = p.bio || "Full-stack Web3 and Solana smart contract developer.";
  const avatarUrl = p.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=Felix";
  const occupation = p.occupation || "Web & Software Development";
  const occupationYears = p.occupationStartYear ? `${p.occupationStartYear} – ${p.occupationEndYear || "Present"}` : "";
  const occupationSkills = Array.isArray(p.occupationSkills) ? p.occupationSkills : [];
  const skills = Array.isArray(p.skills) ? p.skills : [];
  const skillsDetail = Array.isArray(p.skillsDetail) && p.skillsDetail.length > 0
    ? p.skillsDetail
    : skills.map((s) => ({ name: s, level: "Intermediate" }));
  const languages = Array.isArray(p.languages) && p.languages.length > 0
    ? p.languages
    : [{ language: "English", level: "Fluent" }];
  const education = Array.isArray(p.education) ? p.education : [];
  const certifications = Array.isArray(p.certifications) ? p.certifications : [];
  const linkedAccounts = p.linkedAccounts || { google: true, linkedin: false, twitter: false };
  const completeness = p.completenessScore || 85;

  const completedContracts = contracts.filter((c) => c.status === "completed");
  const hourlyRate = p.hourlyRate || 50;
  const successRate = completedContracts.length > 0 && contracts.length > 0
    ? Math.round((completedContracts.length / contracts.length) * 100)
    : 100;

  // Build earnings chart
  const chartData = completedContracts.slice(-6).map((c) => ({
    month: new Date(c.updatedAt || c.createdAt).toLocaleString("default", { month: "short" }),
    amount: Number(c.budget) || 0,
  }));

  // Build reviews
  const reviews = completedContracts.map((c) => ({
    id: c.projectId || c._id,
    name: c.clientPubkey
      ? `Client (${c.clientPubkey.slice(0, 6)}...${c.clientPubkey.slice(-4)})`
      : "Verified Client",
    rating: 5,
    text: `Milestone completed and on-chain escrow released for "${c.title}".`,
    date: new Date(c.updatedAt || c.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  }));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Seller Profile</span>
            <span className="topbar-breadcrumb">Fiverr-style Freelancer Public View</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/freelancer/edit-profile")}>
              <Edit size={14} /> Edit Profile
            </button>
          </div>
        </div>

        <div className="page-container">
          {loading ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "4rem" }}>
              Loading profile details...
            </div>
          ) : (
            <div className="grid-2" style={{ alignItems: "start", gap: 24 }}>
              {/* ══════════════ LEFT COLUMN: PROFILE CARD & CREDENTIALS ══════════════ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Main Identity Card */}
                <div className="card" style={{ position: "relative" }}>
                  {/* Completeness Badge */}
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
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        margin: "0 auto 14px",
                        border: "3px solid var(--accent-purple, #6366f1)",
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.05)",
                        boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
                      }}
                    >
                      <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>{displayName}</h2>
                    {fullName && fullName !== displayName && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>({fullName})</p>
                    )}

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--accent-purple)",
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 14,
                      }}
                    >
                      <Briefcase size={14} />
                      <span>{occupation}</span>
                      {occupationYears && <span style={{ color: "var(--text-muted)" }}>· {occupationYears}</span>}
                    </div>

                    {/* Verified Badges */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                      {linkedAccounts.google && (
                        <span style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                          ✓ Google Verified
                        </span>
                      )}
                      {linkedAccounts.linkedin && (
                        <span style={{ fontSize: 11, background: "rgba(14, 118, 168, 0.15)", padding: "3px 8px", borderRadius: 12, border: "1px solid rgba(14, 118, 168, 0.3)", color: "#38bdf8" }}>
                          ✓ LinkedIn Verified
                        </span>
                      )}
                      {linkedAccounts.twitter && (
                        <span style={{ fontSize: 11, background: "rgba(29, 155, 240, 0.15)", padding: "3px 8px", borderRadius: 12, border: "1px solid rgba(29, 155, 240, 0.3)", color: "#60a5fa" }}>
                          ✓ X / Twitter
                        </span>
                      )}
                      {p.emailVerified && (
                        <span style={{ fontSize: 11, background: "rgba(16, 185, 129, 0.15)", padding: "3px 8px", borderRadius: 12, border: "1px solid rgba(16, 185, 129, 0.3)", color: "var(--accent-green)" }}>
                          ✓ Email Verified
                        </span>
                      )}
                    </div>

                    {/* Stats Strip */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        padding: "12px 0",
                        background: "rgba(255, 255, 255, 0.02)",
                        borderTop: "1px solid var(--border)",
                        borderBottom: "1px solid var(--border)",
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-green)" }}>
                          {completedContracts.length}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Jobs Done</div>
                      </div>
                      <div style={{ width: 1, background: "var(--border)" }} />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-purple)" }}>
                          {hourlyRate} USDC
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Hourly Rate</div>
                      </div>
                      <div style={{ width: 1, background: "var(--border)" }} />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-blue)" }}>
                          {successRate}%
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Success</div>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, textAlign: "left", margin: 0 }}>
                      {bio}
                    </p>
                  </div>
                </div>

                {/* Languages */}
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <Globe size={15} color="var(--accent-purple)" /> Languages
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {languages.map((l, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>{l.language}</span>
                        <span style={{ color: "var(--text-muted)" }}>{l.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resume & Portfolio Links */}
                {(p.portfolioUrl || p.resumeName || (p.portfolioLinks && p.portfolioLinks.length > 0)) && (
                  <div className="card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <FileText size={15} color="var(--accent-green)" /> Portfolio &amp; Resume
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {p.portfolioUrl && (
                        <a
                          href={p.portfolioUrl.startsWith("http") ? p.portfolioUrl : `https://${p.portfolioUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: "rgba(99,102,241,0.08)",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "#a5b4fc",
                            textDecoration: "none",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <ExternalLink size={13} /> {p.portfolioUrl}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Portfolio</span>
                        </a>
                      )}
                      {p.resumeName && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: "rgba(16,185,129,0.08)",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "var(--accent-green)",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Download size={13} /> {p.resumeName}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Resume CV</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ══════════════ RIGHT COLUMN: SKILLS, EDUCATION, REVIEWS ══════════════ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Skills & Experience Levels */}
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                    Skills &amp; Expertise
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {skillsDetail.map((s) => (
                      <div
                        key={s.name}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          background: "rgba(99, 102, 241, 0.12)",
                          border: "1px solid rgba(99, 102, 241, 0.25)",
                          borderRadius: 20,
                          fontSize: 12,
                          color: "#a5b4fc",
                        }}
                      >
                        <strong style={{ color: "#ffffff" }}>{s.name}</strong>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({s.level})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education & Certifications */}
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                    Education &amp; Certifications
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {education.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                          Education
                        </div>
                        {education.map((edu, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                            <GraduationCap size={16} color="var(--accent-purple)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{edu.title} {edu.major ? `in ${edu.major}` : ""}</div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {edu.university} {edu.year ? `· Class of ${edu.year}` : ""}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {certifications.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                          Certifications
                        </div>
                        {certifications.map((cert, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                            <Award size={16} color="var(--accent-amber)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{cert.name}</div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {cert.issuer} {cert.year ? `· ${cert.year}` : ""}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Earnings Chart */}
                {chartData.length > 0 && (
                  <div className="card">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Earnings (Completed Escrows)</h3>
                    <EarningsChart data={chartData} />
                  </div>
                )}

                {/* Reviews */}
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Buyer Reviews</h3>
                  {reviews.length === 0 ? (
                    <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "1.5rem", fontSize: 13 }}>
                      Reviews will appear here once you complete Solana milestone escrow contracts.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {reviews.map((r) => (
                        <div key={r.id} style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                          <div className="flex-between" style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                            <div style={{ display: "flex", gap: 3 }}>
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} size={12} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                              ))}
                              <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>{r.date}</span>
                            </div>
                          </div>
                          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{r.text}</p>
                        </div>
                      ))}
                    </div>
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
