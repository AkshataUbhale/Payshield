import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Briefcase,
  Globe,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Upload,
  User,
  Mail,
  Lock,
  Eye,
  Shield,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import ProgressBar from "../../components/common/ProgressBar";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { submitClientOnboarding } from "../../services/api";

const BUYING_CATEGORIES = [
  "Primary Job & Business",
  "Secondary Business / Side Hustle",
  "Non-Business / Personal Needs",
];

const COMPANY_SIZES = ["Solo / Individual", "2 - 10 employees", "11 - 50 employees", "51+ Enterprise"];

const INDUSTRY_SECTORS = [
  "Software & Web3 Development",
  "E-commerce & Retail",
  "Fintech & Decentralized Finance (DeFi)",
  "Artificial Intelligence & Data",
  "Media & Entertainment",
  "Healthcare & Biotech",
  "Real Estate",
  "Other",
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Mandarin", "Japanese", "Portuguese", "Hindi"];

const TIME_ZONES = [
  "UTC (Coordinated Universal Time)",
  "EST (Eastern Standard Time / New York)",
  "PST (Pacific Standard Time / San Francisco)",
  "GMT (Greenwich Mean Time / London)",
  "CET (Central European Time / Berlin)",
  "IST (Indian Standard Time / Mumbai)",
  "SGT (Singapore Time / Asia)",
];

const DAILY_HOURS = [
  "9:00 AM - 5:00 PM (Standard Business Hours)",
  "8:00 AM - 4:00 PM (Early Shift)",
  "12:00 PM - 8:00 PM (Late Shift)",
  "Flexible / Asynchronous",
  "24/7 Global Team Coverage",
];

const DRAFT_KEY = "ps_client_fiverr_onboarding_draft";

export default function ClientOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { publicKey } = useWallet();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Step 1: Account Identity
    email: user?.email || "",
    username: user?.username || "",
    displayName: user?.displayName || user?.fullName || "",

    // Step 2: Intent & Persona
    clientType: "client_only", // "client_only" | "dual_role"
    buyingCategory: "Primary Job & Business",
    companyName: "",
    companySize: "2 - 10 employees",
    industry: "Software & Web3 Development",

    // Step 3: Public Profile Customization
    avatarUrl: user?.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=ClientCorp",
    aboutMe: "",

    // Step 4: Preferences
    preferredLanguages: ["English"],
    timeZone: "EST (Eastern Standard Time / New York)",
    dailyHours: "9:00 AM - 5:00 PM (Standard Business Hours)",
  });

  // Calculate live completeness score (0 to 100)
  const calculateCompleteness = () => {
    let score = 0;
    // Step 1 (35 pts)
    if (formData.email.trim() && formData.email.includes("@")) score += 15;
    if (formData.username.trim()) score += 10;
    if (formData.displayName.trim()) score += 10;

    // Step 2 (30 pts)
    if (formData.clientType) score += 10;
    if (formData.buyingCategory) score += 10;
    if (formData.companyName.trim() || formData.industry) score += 10;

    // Step 3 (20 pts)
    if (formData.avatarUrl) score += 10;
    if (formData.aboutMe.trim().length >= 30) score += 10;

    // Step 4 (15 pts)
    if (formData.preferredLanguages.length > 0) score += 8;
    if (formData.timeZone && formData.dailyHours) score += 7;

    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();
  const meetsThreshold = completeness >= 65;

  // Restore draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } else if (user) {
        setFormData((prev) => ({
          ...prev,
          email: user.email || prev.email,
          username: user.username || `client_${(user.walletAddress || "user").slice(0, 6)}`,
          displayName: user.displayName || user.fullName || prev.displayName,
        }));
      }
    } catch (e) {
      console.warn("Client draft restore warning:", e);
    }
  }, [user]);

  // Persist draft
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("image/jpeg") && !file.type.includes("image/png") && !file.type.includes("image/svg")) {
      setError("Please upload a valid JPG, PNG, or SVG image.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!formData.username.trim() || formData.username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return false;
    }
    if (!formData.displayName.trim()) {
      setError("Please enter a public display name.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (formData.buyingCategory.includes("Business") && !formData.companyName.trim()) {
      setError("Please enter your Company / Brand Name.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep3 = () => {
    setError("");
    return true;
  };

  const validateStep4 = () => {
    if (formData.preferredLanguages.length === 0) {
      setError("Please select at least one preferred communication language.");
      return false;
    }
    if (!meetsThreshold) {
      setError(`Profile completeness must be at least 65% (current score: ${completeness}%). Please provide additional details.`);
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setError("");
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep4()) return;

    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("ps_token");
      const pubkeyStr = publicKey?.toBase58 ? publicKey.toBase58() : user?.walletAddress;

      const payload = {
        ...formData,
        fullName: formData.displayName.trim(),
        displayName: formData.displayName.trim(),
        username: formData.username.trim(),
        completenessScore: completeness,
        languages: formData.preferredLanguages.map((l) => ({ language: l, level: "Fluent" })),
        availabilityWindow: {
          timeZone: formData.timeZone,
          dailyHours: formData.dailyHours,
        },
        publicKey: pubkeyStr,
      };

      await submitClientOnboarding(payload, token);

      if (user) {
        updateUser({
          ...user,
          fullName: payload.fullName,
          displayName: payload.displayName,
          username: payload.username,
          role: "client",
          onboardingComplete: true,
          avatarUrl: formData.avatarUrl,
        });
      }

      localStorage.removeItem(DRAFT_KEY);
      localStorage.setItem("userRole", "client");

      navigate("/client/dashboard");
    } catch (err) {
      console.error("Client onboarding error:", err);
      setError(err.message || "Failed to complete client onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isBusinessCategory = formData.buyingCategory.includes("Business");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary, #0f172a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 16px",
        position: "relative",
      }}
    >
      <div style={{ width: "100%", maxWidth: 840, position: "relative", zIndex: 1 }}>
        {/* Header with Fiverr-style Buyer Branding & Completeness Meter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: "#6ee7b7",
                marginBottom: 6,
              }}
            >
              <Sparkles size={13} />
              <span>Client &amp; Buyer Setup</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: 0 }}>
              Set Up Your Client / Hiring Profile
            </h1>
          </div>

          {/* Profile Completeness Score Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${meetsThreshold ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
              borderRadius: 12,
              padding: "10px 18px",
              minWidth: 230,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: "var(--text-secondary, #94a3b8)" }}>Completion Score:</span>
              <span style={{ color: meetsThreshold ? "var(--accent-green, #10b981)" : "var(--accent-amber, #f59e0b)" }}>
                {completeness}% {meetsThreshold ? "✓ (Ready)" : "(Min 65% Req)"}
              </span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${completeness}%`,
                  background: meetsThreshold ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #f59e0b, #d97706)",
                  transition: "all 0.4s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Multi-step Form Card */}
        <div
          className="card"
          style={{
            background: "var(--bg-card, #1e293b)",
            border: "1px solid var(--border, rgba(255, 255, 255, 0.1))",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
          }}
        >
          <ProgressBar
            currentStep={step}
            totalSteps={4}
            steps={["Account Identity", "Intent & Persona", "Public Profile", "Preferences"]}
          />

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 16px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#fca5a5",
                fontSize: 13,
              }}
            >
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          {/* ════════════════ STEP 1: ACCOUNT IDENTITY ════════════════ */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Step 1: Account Identity</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "4px 0 0" }}>
                  Provide your primary contact and public identity for escrow milestone contracts.
                </p>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                  <span>Email Address <span style={{ color: "#ef4444" }}>*</span></span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 2 }}>
                    <Lock size={10} /> Private for contract notifications
                  </span>
                </label>
                <div style={{ position: "relative", marginTop: 6 }}>
                  <input
                    id="client-email"
                    type="email"
                    className="form-input"
                    placeholder="company@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", paddingLeft: 38 }}
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                    <span>Username <span style={{ color: "#ef4444" }}>*</span></span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Permanent lock after save</span>
                  </label>
                  <div style={{ position: "relative", marginTop: 6 }}>
                    <input
                      id="client-username"
                      type="text"
                      className="form-input"
                      placeholder="e.g. acme_corp"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                      style={{ width: "100%", paddingLeft: 38 }}
                    />
                    <User size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                    <span>Display Name <span style={{ color: "#ef4444" }}>*</span></span>
                    <span style={{ fontSize: 10, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 2 }}>
                      <Eye size={10} /> Public-facing
                    </span>
                  </label>
                  <input
                    id="client-display-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Labs Inc."
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    style={{ width: "100%", marginTop: 6 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 2: INTENT & PERSONA ════════════════ */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Step 2: Intent &amp; Persona</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "4px 0 0" }}>
                  Customize your buying experience to match your hiring volume and organizational size.
                </p>
              </div>

              {/* Client Type Toggle */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                  Client Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { key: "client_only", label: "Client / Buyer Only", desc: "I only hire freelancers and fund escrow contracts" },
                    { key: "dual_role", label: "Dual-Role (Buyer & Seller)", desc: "I post jobs and also offer development services" },
                  ].map(({ key, label, desc }) => {
                    const isSelected = formData.clientType === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setFormData({ ...formData, clientType: key })}
                        style={{
                          padding: "14px 16px",
                          background: isSelected ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.02)",
                          border: isSelected ? "1px solid var(--accent-green)" : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 12,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? "#ffffff" : "var(--text-primary)" }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                          {desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Buying Category */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                  Buying Category
                </label>
                <select
                  className="form-input"
                  value={formData.buyingCategory}
                  onChange={(e) => setFormData({ ...formData, buyingCategory: e.target.value })}
                  style={{ width: "100%" }}
                >
                  {BUYING_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Business Demographics (Conditional) */}
              {isBusinessCategory && (
                <div style={{ padding: 18, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#a5b4fc" }}>
                    Business Demographics
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                        Company / Brand Name <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Solana Ventures"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        style={{ width: "100%" }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                        Company Size
                      </label>
                      <select
                        className="form-input"
                        value={formData.companySize}
                        onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                        style={{ width: "100%" }}
                      >
                        {COMPANY_SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                      Industry Sector
                    </label>
                    <select
                      className="form-input"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      style={{ width: "100%" }}
                    >
                      {INDUSTRY_SECTORS.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════ STEP 3: PUBLIC PROFILE CUSTOMIZATION ════════════════ */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Step 3: Public Profile Customization</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "4px 0 0" }}>
                  Add a brand logo and company mission so candidates understand your project goals.
                </p>
              </div>

              {/* Profile Picture / Logo */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                  Profile Picture / Company Logo
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 12,
                      border: "2px solid var(--accent-green, #10b981)",
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Building2 size={28} color="var(--text-muted)" />
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="client-logo-upload"
                      className="btn btn-secondary btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                    >
                      <Upload size={14} /> Upload Brand Logo (PNG/JPG)
                    </label>
                    <input
                      id="client-logo-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Recommended: Square 400x400px logo or executive photo.
                    </div>
                  </div>
                </div>
              </div>

              {/* About Me / Company Description */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                    About Me &amp; Hiring Goals
                  </label>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {formData.aboutMe.length} / 600
                  </span>
                </div>
                <textarea
                  className="form-input"
                  rows={4}
                  maxLength={600}
                  placeholder="Describe your company vision, product roadmap, and what qualities you look for in hired engineering talent..."
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>
            </div>
          )}

          {/* ════════════════ STEP 4: PREFERENCES ════════════════ */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Step 4: Preferences &amp; Availability</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "4px 0 0" }}>
                  Set your working hours and preferred languages for milestone reviews and communications.
                </p>
              </div>

              {/* Preferred Languages (Checklist) */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                  Preferred Communication Languages <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                  {LANGUAGES.map((lang) => {
                    const isChecked = formData.preferredLanguages.includes(lang);
                    return (
                      <label
                        key={lang}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 12px",
                          background: isChecked ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.02)",
                          border: isChecked ? "1px solid var(--accent-green)" : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 12,
                          color: isChecked ? "#ffffff" : "var(--text-secondary)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, preferredLanguages: [...formData.preferredLanguages, lang] });
                            } else {
                              setFormData({ ...formData, preferredLanguages: formData.preferredLanguages.filter((l) => l !== lang) });
                            }
                          }}
                        />
                        <span>{lang}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Time Zone & Daily Business Hours */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Primary Time Zone
                  </label>
                  <select
                    className="form-input"
                    value={formData.timeZone}
                    onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {TIME_ZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Daily Business Hours
                  </label>
                  <select
                    className="form-input"
                    value={formData.dailyHours}
                    onChange={(e) => setFormData({ ...formData, dailyHours: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {DAILY_HOURS.map((hr) => (
                      <option key={hr} value={hr}>{hr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ NAVIGATION BAR ════════════════ */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 28,
              paddingTop: 20,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {step > 1 ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleBack}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("/onboarding/role")}
              >
                Change Role
              </button>
            )}

            {step < 4 ? (
              <button
                id="btn-client-next"
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleNext}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                id="btn-client-submit"
                type="button"
                className="btn btn-primary btn-sm"
                disabled={loading || !meetsThreshold}
                onClick={handleSubmit}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: meetsThreshold ? 1 : 0.5,
                  cursor: meetsThreshold ? "pointer" : "not-allowed",
                }}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    Finish &amp; Enter Client Dashboard <CheckCircle size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
