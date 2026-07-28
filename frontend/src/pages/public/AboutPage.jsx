import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SoftAurora from "../../components/SoftAurora";
import {
  Shield, Zap, Lock, Globe, Target, Users, CheckCircle,
  TrendingUp, Award, Activity, ArrowRight, ChevronRight, MessageSquare
} from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeTab, setActiveTab] = useState("mission");

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        alert("MetaMask not detected. Please install MetaMask extension.");
        setConnecting(false);
      }
    } catch {
      setConnecting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflowX: "hidden", color: "var(--text-primary)" }}>
      
      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 60px", height: 68,
        background: "rgba(10,14,26,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Shield size={16} color="white" />
          </div>
          <span style={{
            fontSize: 18, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif",
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            PayShield
          </span>
        </div>

        {/* Navigation Links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <span
            style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", cursor: "pointer", borderBottom: "2px solid #6366f1", paddingBottom: 4 }}
            onClick={() => navigate("/about")}
          >
            About
          </span>
          <span
            style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", transition: "color 0.2s" }}
            onClick={() => navigate("/contact")}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Contact
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button id="btn-nav-login" className="btn btn-ghost btn-sm" onClick={() => navigate("/login")}>Login</button>
          <button
            id="btn-nav-connect"
            className="btn btn-primary btn-sm"
            onClick={handleConnectWallet}
            disabled={connecting}
          >
            {connecting ? <span className="spinner" /> : <><Shield size={14} /> Connect Wallet</>}
          </button>
        </div>
      </nav>

      {/* ── Background Aurora ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 700, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <SoftAurora
          speed={0.4}
          scale={1.6}
          brightness={0.8}
          color1="#7928CA"
          color2="#00DFD8"
          noiseFrequency={2}
          noiseAmplitude={1}
          bandHeight={0.4}
          bandSpread={1}
          octaveDecay={0.15}
          layerOffset={0}
          colorSpeed={0.8}
          enableMouseInteraction
          mouseInfluence={0.2}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 80%, transparent 20%, var(--bg-primary) 85%)",
          pointerEvents: "none"
        }} />
      </div>

      {/* ── Main Section ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "120px 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header Hero */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 20, padding: "6px 16px", marginBottom: 20,
            fontSize: 12, fontWeight: 600, color: "var(--accent-purple)"
          }}>
            <Award size={13} />
            Securing Global Collaboration
          </div>
          
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900, letterSpacing: "-1.5px",
            lineHeight: 1.1, marginBottom: 20,
            color: "#ffffff"
          }}>
            About <span style={{
              background: "linear-gradient(135deg, #FF007A 0%, #7928CA 50%, #00DFD8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>PayShield</span>
          </h1>
          <p style={{
            fontSize: 18, color: "var(--text-secondary)",
            maxWidth: 700, lineHeight: 1.7, margin: "0 auto", opacity: 0.9
          }}>
            We are pioneering a trustless milestone-based payment framework. By combining Solana smart contracts, decentralized IPFS storage, and AI-powered arbitration, we are reshaping global freelance trust.
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 50 }}>
          {["mission", "stats", "roadmap"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 24px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                background: activeTab === tab ? "linear-gradient(135deg,#6366f1,#3b82f6)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeTab === tab ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
                color: activeTab === tab ? "white" : "var(--text-secondary)",
                cursor: "pointer", transition: "all 0.3s ease",
                boxShadow: activeTab === tab ? "0 0 16px rgba(99,102,241,0.3)" : "none"
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ minHeight: 400 }}>
          {activeTab === "mission" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{
                  background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(59,130,246,0.08))",
                  borderLeft: "4px solid #6366f1",
                  borderRadius: "0 12px 12px 0", padding: "16px 24px"
                }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Our Core Mission</h3>
                  <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    We aim to eliminate modern billing bottlenecks, expensive intermediate processors, and delayed payment terms for remote talent and global builders.
                  </p>
                </div>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  PayShield functions as a decentralized escrow mechanism where rules are governed entirely by code. Our design system ensures that money only releases upon verified approvals—building natural confidence.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    "Self-executing escrow structures with near-zero network fees.",
                    "Tamper-proof deliverable registries pinned securely to IPFS.",
                    "Fair, transparent dispute resolution using decentralized consensus layers."
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%", background: "rgba(16,185,129,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", flexShrink: 0
                      }}>
                        <CheckCircle size={14} />
                      </div>
                      <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side Visual Grid */}
              <div style={{
                background: "rgba(18, 22, 40, 0.45)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 24, padding: 32,
                position: "relative", overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute", top: 0, right: 0, width: 220, height: 220,
                  background: "radial-gradient(circle,rgba(99,102,241,0.12),transparent 75%)", pointerEvents: "none"
                }} />
                
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>System Highlights</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { title: "Solana Escrow", value: "Smart Contract", desc: "Decentralized fund custody", color: "purple" },
                    { title: "Deliverables", value: "IPFS Network", desc: "Tamper-proof storage", color: "blue" },
                    { title: "Arbitration", value: "AI Arbitrator", desc: "Instant dispute resolution", color: "green" },
                    { title: "Protocols", value: "0.5% Fee", desc: "Extremely cost-effective", color: "cyan" }
                  ].map((hl, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 16, padding: 20, cursor: "default", transition: "all 0.3s ease"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.5 }}>{hl.title}</span>
                      <div style={{ fontSize: 16, fontWeight: 800, margin: "4px 0", color: "#ffffff" }}>{hl.value}</div>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{hl.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 40 }}>
                {[
                  { value: "$50M+", label: "Total Escrow Volume", icon: TrendingUp, color: "linear-gradient(135deg, #FF007A, #7928CA)" },
                  { value: "0%", label: "Payment Defaults", icon: Shield, color: "linear-gradient(135deg, #10b981, #06b6d4)" },
                  { value: "50k+", label: "Verified Users", icon: Users, color: "linear-gradient(135deg, #6366f1, #3b82f6)" },
                  { value: "100%", label: "On-Chain Resolution", icon: Activity, color: "linear-gradient(135deg, #f59e0b, #ef4444)" }
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(18, 22, 40, 0.45)", backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "28px 24px",
                      textAlign: "center", transition: "all 0.3s ease", cursor: "default"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                      e.currentTarget.style.boxShadow = "0 8px 30px rgba(99,102,241,0.12)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.03)",
                      display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
                    }}>
                      <stat.icon size={20} style={{ color: "#6366f1" }} />
                    </div>
                    <div style={{
                      fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif",
                      background: stat.color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      marginBottom: 8
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Ecosystem details */}
              <div style={{
                background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 20, padding: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32
              }}>
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Transparent Operations</h4>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Every transaction, contract status transition, and artifact submission is logged fully to the underlying public blockchain state. PayShield ensures that verification does not depend on closed servers.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Reliable AI Disputes</h4>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Our integrated AI Arbitrator handles disputes in minutes instead of days. Resolving milestones programmatically using cryptographically signed project scopes means near-perfect resolution speeds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "roadmap" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 800, margin: "0 auto" }}>
              {[
                { phase: "Phase 1: Escrows & Smart Contracts", status: "Completed", desc: "Core Solana escrow architecture, Metamask/Web3 wallet integration, and basic milestone workflows." },
                { phase: "Phase 2: Decentralized Storage & Verification", status: "Completed", desc: "Deliverable uploads linked directly to IPFS hashes for transparent verification on-chain." },
                { phase: "Phase 3: AI-Powered Arbitration & Disputes", status: "Active", desc: "Deep integration of AI Arbitrator module to handle milestone disputes using secure LLM arbitration." },
                { phase: "Phase 4: Multi-Chain Escalations & Oracle Networks", status: "Upcoming", desc: "Cross-chain compatibility and decentralized network consensus integration for complex, custom disputes." }
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(18, 22, 40, 0.45)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "24px 28px",
                    display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start"
                  }}
                >
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: step.status === "Completed" ? "#10b981" : step.status === "Active" ? "#6366f1" : "rgba(255,255,255,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{step.phase}</h4>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>{step.desc}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 12,
                    background: step.status === "Completed" ? "rgba(16,185,129,0.12)" : step.status === "Active" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                    color: step.status === "Completed" ? "#10b981" : step.status === "Active" ? "#6366f1" : "var(--text-muted)"
                  }}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Values Grid ── */}
        <div style={{ marginTop: 100 }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Core Values</h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
              The principles behind how we build a global trustless layer.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { icon: Lock, title: "Trustless Security", desc: "No trust needed between counterparts. The Solana smart contract holds funds safely and behaves strictly according to verified code rules." },
              { icon: Users, title: "Frictionless On-Chain Identity", desc: "Build reputation through concrete milestone outcomes. Your project completion history and reviews live in your decentralized ID." },
              { icon: Zap, title: "Decentralized Settlement", desc: "Escape traditional banking holds and expensive card processor fees. Settle milestone transactions globally in seconds via stablecoins." }
            ].map((value, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(18, 22, 40, 0.45)", backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 20, padding: 32,
                  transition: "all 0.3s ease", cursor: "default"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.12)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", marginBottom: 20
                }}>
                  <value.icon size={22} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{value.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 60px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", zIndex: 2, background: "rgba(10,14,26,0.85)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={16} color="var(--accent-purple)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>PayShield © 2025</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Docs", "GitHub"].map(l => (
            <span key={l} style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>{l}</span>
          ))}
        </div>
      </footer>

    </div>
  );
}
