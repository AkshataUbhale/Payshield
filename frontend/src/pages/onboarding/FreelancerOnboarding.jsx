import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  DollarSign,
  Clock,
  Award,
  Link as LinkIcon,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Upload,
  Globe,
  Briefcase,
  GraduationCap,
  FileText,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  Plus,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";
import ProgressBar from "../../components/common/ProgressBar";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import { submitFreelancerOnboarding } from "../../services/api";

const OCCUPATIONS = [
  {
    name: "Web & Software Development",
    skills: ["React", "Node.js", "TypeScript", "Next.js", "Python", "Full-Stack Web3", "REST APIs", "GraphQL"],
  },
  {
    name: "Blockchain & Smart Contracts",
    skills: ["Solana", "Rust", "Anchor Framework", "EVM / Solidity", "DeFi Protocols", "Tokenomics", "Smart Contract Audit"],
  },
  {
    name: "AI & Machine Learning",
    skills: ["LangChain", "LLM Fine-tuning", "Python", "PyTorch", "OpenAI APIs", "Vector Databases", "Prompt Engineering"],
  },
  {
    name: "Design & Creative",
    skills: ["UI/UX Design", "Figma", "Design Systems", "Mobile App UI", "Brand Identity", "3D Modeling", "Motion Graphics"],
  },
  {
    name: "Writing & Translation",
    skills: ["Technical Writing", "Whitepapers", "Copywriting", "SEO Content", "API Documentation", "Grant Proposals"],
  },
  {
    name: "DevOps & Cloud Architecture",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD Pipelines", "Solana RPC Nodes", "Cybersecurity", "Linux Systems"],
  },
];

const LANGUAGES_LIST = [
  "English", "Spanish", "French", "German", "Mandarin", "Japanese", "Russian", "Portuguese", "Hindi", "Arabic"
];

const PROFICIENCY_LEVELS = ["Basic", "Conversational", "Fluent", "Native"];

const DRAFT_KEY = "ps_freelancer_fiverr_onboarding_draft";

export default function FreelancerOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { publicKey } = useWallet();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState("");

  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    firstName: "",
    lastName: "",
    displayName: "",
    avatarUrl: "",
    bio: "",
    languages: [{ language: "English", level: "Fluent" }],

    // Step 2: Professional Info
    occupation: "Web & Software Development",
    occupationStartYear: "2021",
    occupationEndYear: "2026",
    occupationSkills: ["React", "TypeScript", "Solana"],
    skillsDetail: [
      { name: "React", level: "Expert" },
      { name: "TypeScript", level: "Intermediate" },
      { name: "Solana", level: "Intermediate" },
    ],
    newSkillInput: "",
    newSkillLevel: "Intermediate",
    education: [
      { country: "United States", university: "Stanford University", title: "B.Sc", major: "Computer Science", year: "2023" }
    ],
    certifications: [
      { name: "Solana Core Developer Certification", issuer: "Solana Foundation", year: "2024" }
    ],
    personalWebsite: "",
    portfolioUrl: "",
    portfolioLinks: [],
    portfolioFiles: [],
    resumeUrl: "",
    resumeName: "",

    // Step 3: Linked Accounts
    linkedAccounts: {
      google: true,
      linkedin: false,
      twitter: false,
      showPublic: false,
    },

    // Step 4: Account Security
    email: user?.email || "",
    phone: {
      countryCode: "+1",
      number: "",
      verified: false,
    },
    hourlyRate: 50,
  });

  // Calculate live completeness score (0 to 100)
  const calculateCompleteness = () => {
    let score = 0;
    // Step 1 items (35 pts max)
    if (formData.firstName.trim() && formData.lastName.trim()) score += 8;
    if (formData.displayName.trim()) score += 8;
    if (formData.avatarUrl) score += 7;
    if (formData.bio.trim().length >= 150) score += 8;
    if (formData.languages.length > 0) score += 4;

    // Step 2 items (35 pts max)
    if (formData.occupation && formData.occupationSkills.length >= 2) score += 10;
    if (formData.skillsDetail.length >= 2) score += 10;
    if (formData.education.length > 0 || formData.certifications.length > 0) score += 5;
    if (formData.portfolioUrl || formData.portfolioLinks.length > 0 || formData.resumeName) score += 10;

    // Step 3 items (15 pts max)
    if (formData.linkedAccounts.google || formData.linkedAccounts.linkedin || formData.linkedAccounts.twitter) score += 15;

    // Step 4 items (15 pts max)
    if (formData.email.trim()) score += 8;
    if (emailVerified) score += 4;
    if (formData.phone.number.trim() || phoneVerified) score += 3;

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
          firstName: user.firstName || (user.fullName ? user.fullName.split(" ")[0] : ""),
          lastName: user.lastName || (user.fullName ? user.fullName.split(" ").slice(1).join(" ") : ""),
          displayName: user.displayName || user.username || user.fullName || "",
          email: user.email || prev.email,
          avatarUrl: user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
          bio: user.bio || "",
        }));
      }
    } catch (e) {
      console.warn("Draft restore warning:", e);
    }
  }, [user]);

  // Persist draft
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  // Profile image upload simulation
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("image/jpeg") && !file.type.includes("image/png")) {
      setError("Please upload a high-resolution JPG or PNG image.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Resume upload simulation
  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Resume file size must be less than 10MB.");
      return;
    }
    setError("");
    setFormData((prev) => ({
      ...prev,
      resumeName: file.name,
      resumeUrl: `ipfs://bafybeicv${Math.random().toString(36).substring(2, 9)}/${file.name}`,
    }));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First and Last name are required.");
      return false;
    }
    if (!formData.displayName.trim()) {
      setError("Display Name is required.");
      return false;
    }
    if (formData.bio.trim().length < 150) {
      setError(`Bio must be at least 150 characters (currently ${formData.bio.trim().length}).`);
      return false;
    }
    if (formData.bio.trim().length > 600) {
      setError("Bio cannot exceed 600 characters.");
      return false;
    }
    if (formData.languages.length === 0) {
      setError("Please add at least one spoken language.");
      return false;
    }
    setError("");
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (formData.occupationSkills.length < 2) {
      setError("Please select at least 2 occupation sub-skills.");
      return false;
    }
    if (formData.skillsDetail.length < 2) {
      setError("Please list at least 2 skills with your proficiency level.");
      return false;
    }
    setError("");
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    setError("");
    return true;
  };

  // Step 4 Validation
  const validateStep4 = () => {
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please provide a valid email address.");
      return false;
    }
    if (!meetsThreshold) {
      setError(`Profile completeness must be at least 65% (current score: ${completeness}%). Please complete additional fields.`);
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

  const handleAddLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, { language: "Spanish", level: "Conversational" }],
    }));
  };

  const handleRemoveLanguage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== idx),
    }));
  };

  const handleAddSkillTag = () => {
    if (!formData.newSkillInput.trim()) return;
    const val = formData.newSkillInput.trim();
    if (formData.skillsDetail.some((s) => s.name.toLowerCase() === val.toLowerCase())) return;
    if (formData.skillsDetail.length >= 15) {
      setError("Maximum 15 skill tags allowed.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skillsDetail: [...prev.skillsDetail, { name: val, level: prev.newSkillLevel }],
      newSkillInput: "",
    }));
  };

  const handleRemoveSkillTag = (nameToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skillsDetail: prev.skillsDetail.filter((s) => s.name !== nameToRemove),
    }));
  };

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { country: "United States", university: "", title: "B.Sc", major: "", year: "2024" },
      ],
    }));
  };

  const handleRemoveEducation = (idx) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx),
    }));
  };

  const handleAddCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: "", issuer: "", year: "2024" },
      ],
    }));
  };

  const handleRemoveCertification = (idx) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep4()) return;

    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("ps_token");
      const pubkeyStr = publicKey?.toBase58 ? publicKey.toBase58() : user?.walletAddress;

      const flatSkills = formData.skillsDetail.map((s) => s.name);

      const payload = {
        ...formData,
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        displayName: formData.displayName.trim(),
        skills: flatSkills,
        completenessScore: completeness,
        emailVerified: true,
        publicKey: pubkeyStr,
      };

      await submitFreelancerOnboarding(payload, token);

      if (user) {
        updateUser({
          ...user,
          fullName: payload.fullName,
          displayName: payload.displayName,
          role: "freelancer",
          onboardingComplete: true,
          skills: flatSkills,
          avatarUrl: formData.avatarUrl,
        });
      }

      localStorage.removeItem(DRAFT_KEY);
      localStorage.setItem("userRole", "freelancer");

      navigate("/freelancer/dashboard");
    } catch (err) {
      console.error("Freelancer onboarding error:", err);
      setError(err.message || "Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeOccObj = OCCUPATIONS.find((o) => o.name === formData.occupation) || OCCUPATIONS[0];

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
        {/* Header with Fiverr-style Branding & Completeness Meter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: "#a5b4fc",
                marginBottom: 6,
              }}
            >
              <Sparkles size={13} />
              <span>Freelancer Profile Setup</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: 0 }}>
              Become a Verified PayShield Seller
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
            steps={["Personal Info", "Professional Info", "Linked Accounts", "Account Security"]}
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

          {/* ════════════════ STEP 1: PERSONAL INFO ════════════════ */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Step 1: Personal Info</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "4px 0 0" }}>
                  Tell us a bit about yourself. This information will appear on your public seller profile.
                </p>
              </div>

              {/* Full Name & Display Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                    <span>First & Last Name <span style={{ color: "#ef4444" }}>*</span></span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 2 }}>
                      <Lock size={10} /> Private / Admin only
                    </span>
                  </label>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <input
                      id="input-first-name"
                      type="text"
                      className="form-input"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      style={{ width: "50%" }}
                    />
                    <input
                      id="input-last-name"
                      type="text"
                      className="form-input"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      style={{ width: "50%" }}
                    />
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
                    id="input-display-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. AlexV_Dev"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    style={{ width: "100%", marginTop: 6 }}
                  />
                </div>
              </div>

              {/* Profile Picture */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                  Profile Picture <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: "50%",
                      border: "2px solid var(--accent-purple, #6366f1)",
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <ImageIcon size={28} color="var(--text-muted)" />
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="avatar-file-upload"
                      className="btn btn-secondary btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                    >
                      <Upload size={14} /> Upload High-Res Face Shot (JPG/PNG)
                    </label>
                    <input
                      id="avatar-file-upload"
                      type="file"
                      accept="image/png, image/jpeg"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Must be a clear headshot or brand avatar. Maximum size 5MB.
                    </div>
                  </div>
                </div>
              </div>

              {/* Description / Bio */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                    Description / Bio <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <span style={{ fontSize: 12, color: formData.bio.length < 150 || formData.bio.length > 600 ? "#ef4444" : "var(--accent-green)" }}>
                    {formData.bio.length} / 150–600 characters
                  </span>
                </div>
                <textarea
                  id="freelancer-bio"
                  className="form-input"
                  rows={4}
                  placeholder="Share a bit about your work experience, notable Solana or Web3 projects you've built, and what makes your deliverables top-tier (minimum 150 characters)..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              {/* Languages Row Adder */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>
                    Languages <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddLanguage} style={{ fontSize: 12 }}>
                    <Plus size={12} /> Add Language
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {formData.languages.map((lang, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <select
                        className="form-input"
                        value={lang.language}
                        onChange={(e) => {
                          const updated = [...formData.languages];
                          updated[idx].language = e.target.value;
                          setFormData({ ...formData, languages: updated });
                        }}
                        style={{ flex: 1 }}
                      >
                        {LANGUAGES_LIST.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <select
                        className="form-input"
                        value={lang.level}
                        onChange={(e) => {
                          const updated = [...formData.languages];
                          updated[idx].level = e.target.value;
                          setFormData({ ...formData, languages: updated });
                        }}
                        style={{ flex: 1 }}
                      >
                        {PROFICIENCY_LEVELS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      {formData.languages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(idx)}
                          style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 6 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 2: PROFESSIONAL INFO ════════════════ */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Step 2: Professional Info</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "4px 0 0" }}>
                  Highlight your core occupation, specialized skills, case studies, and uploaded resume.
                </p>
              </div>

              {/* Occupation & Years */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Your Occupation <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value, occupationSkills: [] })}
                    style={{ width: "100%" }}
                  >
                    {OCCUPATIONS.map((o) => (
                      <option key={o.name} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    From Year
                  </label>
                  <select
                    className="form-input"
                    value={formData.occupationStartYear}
                    onChange={(e) => setFormData({ ...formData, occupationStartYear: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    To Year
                  </label>
                  <select
                    className="form-input"
                    value={formData.occupationEndYear}
                    onChange={(e) => setFormData({ ...formData, occupationEndYear: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    {["2024", "2025", "2026", "Present"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Occupation Sub-skills (2 to 5 checkboxes) */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                  Occupation Skills (Choose 2 to 5) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                  {activeOccObj.skills.map((sub) => {
                    const isChecked = formData.occupationSkills.includes(sub);
                    return (
                      <label
                        key={sub}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 12px",
                          background: isChecked ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.03)",
                          border: isChecked ? "1px solid var(--accent-purple)" : "1px solid rgba(255,255,255,0.08)",
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
                              if (formData.occupationSkills.length >= 5) {
                                setError("Maximum 5 occupation sub-skills allowed.");
                                return;
                              }
                              setFormData({ ...formData, occupationSkills: [...formData.occupationSkills, sub] });
                            } else {
                              setFormData({ ...formData, occupationSkills: formData.occupationSkills.filter((s) => s !== sub) });
                            }
                          }}
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Skills Tag Input with Proficiency (Up to 15) */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                  Skills & Proficiency Tags (Up to 15) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add skill (e.g. Anchor, Rust, Docker)..."
                    value={formData.newSkillInput}
                    onChange={(e) => setFormData({ ...formData, newSkillInput: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkillTag())}
                    style={{ flex: 2 }}
                  />
                  <select
                    className="form-input"
                    value={formData.newSkillLevel}
                    onChange={(e) => setFormData({ ...formData, newSkillLevel: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSkillTag}>
                    Add
                  </button>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {formData.skillsDetail.map((s) => (
                    <span
                      key={s.name}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        background: "rgba(99, 102, 241, 0.12)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        borderRadius: 20,
                        fontSize: 12,
                        color: "#a5b4fc",
                      }}
                    >
                      <strong>{s.name}</strong> ({s.level})
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillTag(s.name)}
                        style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Education & Certifications (Optional) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Education</label>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddEducation} style={{ fontSize: 11 }}>
                      + Add
                    </button>
                  </div>
                  {formData.education.map((edu, idx) => (
                    <div key={idx} style={{ padding: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 8 }}>
                      <input
                        className="form-input"
                        placeholder="University / College"
                        value={edu.university}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[idx].university = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        style={{ marginBottom: 6, fontSize: 12 }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          className="form-input"
                          placeholder="Major (e.g. CS)"
                          value={edu.major}
                          onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].major = e.target.value;
                            setFormData({ ...formData, education: updated });
                          }}
                          style={{ flex: 1, fontSize: 12 }}
                        />
                        <input
                          className="form-input"
                          placeholder="Year"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].year = e.target.value;
                            setFormData({ ...formData, education: updated });
                          }}
                          style={{ width: 70, fontSize: 12 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Certifications</label>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddCertification} style={{ fontSize: 11 }}>
                      + Add
                    </button>
                  </div>
                  {formData.certifications.map((cert, idx) => (
                    <div key={idx} style={{ padding: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 8 }}>
                      <input
                        className="form-input"
                        placeholder="Certificate Name"
                        value={cert.name}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].name = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        style={{ marginBottom: 6, fontSize: 12 }}
                      />
                      <input
                        className="form-input"
                        placeholder="Awarding Body (e.g. Solana Foundation)"
                        value={cert.issuer}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].issuer = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        style={{ fontSize: 12 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio & Resume Uploads */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Portfolio / Case Study URL
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://yourportfolio.io or GitHub link"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                    Resume / CV Upload (PDF/DOCX up to 10MB)
                  </label>
                  <label
                    htmlFor="resume-upload"
                    className="form-input"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      padding: "8px 14px",
                    }}
                  >
                    <span style={{ fontSize: 12, color: formData.resumeName ? "var(--accent-green)" : "var(--text-muted)" }}>
                      {formData.resumeName || "Choose file to upload..."}
                    </span>
                    <Upload size={14} color="var(--accent-purple)" />
                  </label>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf, .docx, .doc"
                    style={{ display: "none" }}
                    onChange={handleResumeUpload}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 3: LINKED ACCOUNTS & SOCIALS ════════════════ */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Step 3: Linked Accounts &amp; Socials</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "4px 0 0" }}>
                  Connecting your verified accounts increases your buyer trust and profile score.
                </p>
              </div>

              {/* OAuth Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { key: "google", label: "Google", icon: "🌐", desc: "Identity & Authenticated Email" },
                  { key: "linkedin", label: "LinkedIn", icon: "💼", desc: "Professional Career & Network Verification" },
                  { key: "twitter", label: "X (formerly Twitter)", icon: "🐦", desc: "Web3 Ecosystem & Community Presence" },
                ].map(({ key, label, icon, desc }) => {
                  const isConnected = formData.linkedAccounts[key];
                  return (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 18px",
                        background: isConnected ? "rgba(16, 185, 129, 0.08)" : "rgba(255,255,255,0.02)",
                        border: isConnected ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${isConnected ? "btn-success" : "btn-secondary"}`}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            linkedAccounts: {
                              ...formData.linkedAccounts,
                              [key]: !isConnected,
                            },
                          });
                        }}
                      >
                        {isConnected ? (
                          <>
                            <CheckCircle size={13} /> Connected
                          </>
                        ) : (
                          "Connect"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Privacy Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "rgba(99, 102, 241, 0.08)",
                  borderRadius: 10,
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldCheck size={18} color="var(--accent-purple)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Privacy Protection</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Show verified badge publicly without exposing raw handles.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.linkedAccounts.showPublic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      linkedAccounts: { ...formData.linkedAccounts, showPublic: e.target.checked },
                    })
                  }
                  style={{ width: 18, height: 18 }}
                />
              </div>
            </div>
          )}

          {/* ════════════════ STEP 4: ACCOUNT SECURITY ════════════════ */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Step 4: Account Security</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: "4px 0 0" }}>
                  Verification ensures only legitimate developers take on Solana escrow milestone contracts.
                </p>
              </div>

              {/* Email Verification Workflow */}
              <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                  <span>Email Address <span style={{ color: "#ef4444" }}>*</span></span>
                  {emailVerified ? (
                    <span style={{ color: "var(--accent-green)", fontSize: 12, fontWeight: 700 }}>✓ Verified</span>
                  ) : (
                    <span style={{ color: "var(--accent-amber)", fontSize: 12 }}>Verification Required</span>
                  )}
                </label>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  {!emailVerified && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEmailOtpSent(true)}
                    >
                      {emailOtpSent ? "Resend Link" : "Send Verification Link"}
                    </button>
                  )}
                </div>

                {emailOtpSent && !emailVerified && (
                  <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter 6-digit confirmation code (e.g. 123456)"
                      value={emailOtpInput}
                      onChange={(e) => setEmailOtpInput(e.target.value)}
                      style={{ flex: 1, fontSize: 13 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (emailOtpInput.length >= 4) {
                          setEmailVerified(true);
                        } else {
                          setError("Please enter a valid 6-digit verification code.");
                        }
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>

              {/* Phone Number Workflow */}
              <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                  <span>Phone Number (Private / 2FA)</span>
                  {phoneVerified ? (
                    <span style={{ color: "var(--accent-green)", fontSize: 12, fontWeight: 700 }}>✓ Verified</span>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Hidden from public</span>
                  )}
                </label>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <select
                    className="form-input"
                    value={formData.phone.countryCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: { ...formData.phone, countryCode: e.target.value },
                      })
                    }
                    style={{ width: 100 }}
                  >
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+81">+81 (JP)</option>
                  </select>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="(555) 000-0000"
                    value={formData.phone.number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: { ...formData.phone, number: e.target.value },
                      })
                    }
                    style={{ flex: 1 }}
                  />
                  {!phoneVerified && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPhoneOtpSent(true)}
                    >
                      Verify by SMS
                    </button>
                  )}
                </div>

                {phoneOtpSent && !phoneVerified && (
                  <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter SMS OTP code"
                      value={phoneOtpInput}
                      onChange={(e) => setPhoneOtpInput(e.target.value)}
                      style={{ flex: 1, fontSize: 13 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setPhoneVerified(true)}
                    >
                      Verify Code
                    </button>
                  </div>
                )}
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                  Standard Hourly Rate (USDC)
                </label>
                <div style={{ position: "relative", maxWidth: 220 }}>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    style={{ width: "100%", paddingLeft: 38 }}
                  />
                  <DollarSign
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                  />
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
                id="btn-freelancer-next"
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleNext}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                id="btn-freelancer-submit"
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
                    Finish &amp; Publish Seller Profile <CheckCircle size={14} />
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
