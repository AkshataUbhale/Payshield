import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Zap, Lock, Globe, ArrowRight, CheckCircle, ChevronRight
} from "lucide-react";
import Cubes from "../components/Cubes";

// ── Laser Flow Lines (SVG animated lasers) ──────────────────────────────────
function LaserFlow() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#6366f1", "#3b82f6", "#06b6d4", "#8b5cf6", "#a78bfa"];
    const beams = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      angle: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
      length: 60 + Math.random() * 120,
      color: COLORS[i % COLORS.length],
      alpha: 0.25 + Math.random() * 0.45,
      width: 0.6 + Math.random() * 1.2,
      turn: (Math.random() - 0.5) * 0.015,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      beams.forEach(b => {
        b.angle += b.turn;
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;

        // wrap
        if (b.x < -b.length) b.x = canvas.width + b.length;
        if (b.x > canvas.width + b.length) b.x = -b.length;
        if (b.y < -b.length) b.y = canvas.height + b.length;
        if (b.y > canvas.height + b.length) b.y = -b.length;

        const x2 = b.x - Math.cos(b.angle) * b.length;
        const y2 = b.y - Math.sin(b.angle) * b.length;

        const grad = ctx.createLinearGradient(x2, y2, b.x, b.y);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.5, b.color + Math.round(b.alpha * 80).toString(16).padStart(2,"0"));
        grad.addColorStop(1, b.color + "ff");

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = b.width;
        ctx.lineCap = "round";
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", borderRadius: "inherit"
      }}
    />
  );
}

// ── How It Works Stepper ────────────────────────────────────────────────────
const STEPS = [
  {
    n: 1, emoji: "🔐",
    title: "Connect Wallet",
    desc: "Link your MetaMask or compatible Web3 wallet in one click. No signups needed — your keys, your control."
  },
  {
    n: 2, emoji: "📝",
    title: "Create Escrow Contract",
    desc: "Define the freelancer's wallet, payment amount, milestones, and deadline. One click deploys the contract on-chain."
  },
  {
    n: 3, emoji: "📦",
    title: "Work Submitted via IPFS",
    desc: "The freelancer uploads deliverables. Files are pinned to IPFS — tamper-proof and permanently verifiable."
  },
  {
    n: 4, emoji: "✅",
    title: "Client Reviews & Approves",
    desc: "Review the IPFS-linked deliverables inside PayShield. Approve to release payment or raise a dispute."
  },
  {
    n: 5, emoji: "💸",
    title: "Funds Released On-Chain",
    desc: "Smart contract executes instantly — no bank, no middleman. Funds arrive in the freelancer's wallet in seconds."
  },
];

function HowItWorksStepper() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  // Auto-advance every 3s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleClick = (i) => {
    clearInterval(intervalRef.current);
    setActive(i);
    intervalRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % STEPS.length);
    }, 3000);
  };

  return (
    <div style={{ display: "flex", gap: 40, alignItems: "flex-start", maxWidth: 900, margin: "0 auto" }}>
      {/* Left: step list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 280, flexShrink: 0 }}>
        {STEPS.map((s, i) => {
          const isActive = i === active;
          const isDone   = i < active;
          return (
            <div
              key={s.n}
              style={{ display: "flex", gap: 0, cursor: "pointer" }}
              onClick={() => handleClick(i)}
            >
              {/* Line + dot */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16, flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: isActive ? "2px solid #6366f1"
                                   : isDone ? "2px solid #10b981"
                                   : "2px solid rgba(255,255,255,0.15)",
                  background: isActive ? "linear-gradient(135deg,#6366f1,#3b82f6)"
                                       : isDone ? "#10b981"
                                       : "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isDone ? 14 : 13,
                  fontWeight: 700, color: "white",
                  boxShadow: isActive ? "0 0 16px rgba(99,102,241,0.55)" : "none",
                  transition: "all 0.35s ease",
                  flexShrink: 0, zIndex: 1
                }}>
                  {isDone ? "✓" : s.n}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 2, flexGrow: 1, minHeight: 36,
                    background: isDone ? "#10b981" : "rgba(255,255,255,0.08)",
                    transition: "background 0.4s ease",
                    margin: "3px 0"
                  }} />
                )}
              </div>

              {/* Label */}
              <div style={{ paddingBottom: i < STEPS.length - 1 ? 28 : 0, paddingTop: 6 }}>
                <div style={{
                  fontSize: 14, fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--text-primary)" : isDone ? "#10b981" : "var(--text-muted)",
                  transition: "color 0.3s ease",
                  marginBottom: 3
                }}>
                  {s.title}
                </div>
                {isActive && (
                  <div style={{ fontSize: 12, color: "var(--accent-purple)", fontWeight: 600, letterSpacing: 0.3 }}>
                    Currently viewing
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: detail panel */}
      <div style={{ flex: 1 }}>
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            style={{
              display: i === active ? "block" : "none",
            }}
          >
            <div style={{
              background: "linear-gradient(135deg,rgba(99,102,241,0.06),rgba(59,130,246,0.04))",
              border: "1px solid rgba(99,102,241,0.18)",
              borderRadius: 20,
              padding: "40px 36px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Glow dot */}
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: 200, height: 200,
                background: "radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)",
                borderRadius: "50%", pointerEvents: "none"
              }} />

              <div style={{ fontSize: 52, marginBottom: 20 }}>{s.emoji}</div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 20, padding: "4px 14px",
                fontSize: 11, fontWeight: 700,
                color: "var(--accent-purple)",
                letterSpacing: 1, marginBottom: 16
              }}>
                STEP {s.n} OF {STEPS.length}
              </div>

              <h3 style={{
                fontSize: 24, fontWeight: 800,
                marginBottom: 14, letterSpacing: -0.4
              }}>
                {s.title}
              </h3>
              <p style={{
                fontSize: 15, color: "var(--text-secondary)",
                lineHeight: 1.75, maxWidth: 420
              }}>
                {s.desc}
              </p>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: 6, marginTop: 32 }}>
                {STEPS.map((_, j) => (
                  <div
                    key={j}
                    onClick={() => handleClick(j)}
                    style={{
                      width: j === active ? 24 : 8,
                      height: 8, borderRadius: 4,
                      background: j === active ? "var(--accent-purple)"
                                : j < active ? "var(--accent-green)"
                                : "rgba(255,255,255,0.12)",
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feature cards with Laser Flow ───────────────────────────────────────────
const FEATURES = [
  {
    icon: Lock, title: "Blockchain Escrow",
    desc: "Funds locked in a tamper-proof smart contract. Released only upon work approval.",
    color: "purple",
  },
  {
    icon: Globe, title: "Cross-Border Payments",
    desc: "Pay freelancers anywhere in the world with USDC — no banks, no delays.",
    color: "blue",
  },
  {
    icon: Zap, title: "IPFS Deliverables",
    desc: "Work submissions stored on decentralized IPFS — permanent and verifiable.",
    color: "cyan",
  },
  {
    icon: CheckCircle, title: "Dispute Resolution",
    desc: "Neutral on-chain arbitration resolves conflicts fairly and transparently.",
    color: "green",
  },
];

const STATS = [
  { value: "$2.4M+", label: "Total Escrowed" },
  { value: "1,200+", label: "Contracts Settled" },
  { value: "98.6%",  label: "Dispute-Free Rate" },
  { value: "140+",   label: "Countries Served" },
];

// ── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);

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
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflowX: "hidden" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 60px", height: 68,
        background: "rgba(10,14,26,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            PayShield
          </span>
        </div>
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

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Cubes background
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: 68,
      }}>
        {/* Cubes fill the hero */}
        <div style={{
          position: "absolute", inset: 0,
          opacity: 0.55,
          zIndex: 0,
        }}>
          <Cubes
            gridSize={10}
            maxAngle={45}
            radius={3}
            borderStyle="1px solid rgba(99,102,241,0.3)"
            faceColor="#0a0e1a"
            rippleColor="#6366f1"
            rippleSpeed={1.5}
            autoAnimate
            rippleOnClick
          />
        </div>

        {/* Gradient overlay so text is readable */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, var(--bg-primary) 90%)",
          pointerEvents: "none"
        }} />

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 2,
          textAlign: "center",
          padding: "0 40px",
          maxWidth: 860,
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 20, padding: "6px 16px", marginBottom: 28,
            fontSize: 12, fontWeight: 600, color: "var(--accent-purple)"
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent-green)",
              boxShadow: "0 0 8px rgba(16,185,129,0.7)",
              display: "inline-block"
            }} />
            Powered by Ethereum Smart Contracts
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 900, letterSpacing: "-2px",
            lineHeight: 1.06, marginBottom: 24
          }}>
            Freelance Payments,{" "}
            <span className="gradient-text">Secured by Blockchain</span>
          </h1>

          <p style={{
            fontSize: 18, color: "var(--text-secondary)",
            maxWidth: 560, lineHeight: 1.7, marginBottom: 40, margin: "0 auto 40px"
          }}>
            PayShield creates tamper-proof escrow contracts between clients and
            freelancers — ensuring fair pay, on-chain dispute resolution, and
            IPFS-verified deliverables.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
            <button
              id="btn-hero-connect"
              className="btn btn-primary btn-lg"
              onClick={handleConnectWallet}
              disabled={connecting}
            >
              {connecting
                ? <><span className="spinner" /> Connecting…</>
                : <><Shield size={18} /> Connect Wallet</>}
            </button>
            <button
              id="btn-hero-login"
              className="btn btn-ghost btn-lg"
              onClick={() => navigate("/login")}
            >
              Login with Email <ArrowRight size={16} />
            </button>
          </div>

          {/* Stats bar */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "22px 48px",
            maxWidth: 700, margin: "0 auto"
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif",
                  background: "linear-gradient(135deg,#a5b4fc,#60a5fa)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHY PAYSHIELD — with Laser Flow canvas background
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        padding: "100px 60px",
        overflow: "hidden",
      }}>
        {/* Laser Flow behind feature cards */}
        <LaserFlow />

        {/* Dark overlay so cards pop */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, var(--bg-primary) 0%, rgba(10,14,26,0.85) 40%, rgba(10,14,26,0.85) 60%, var(--bg-primary) 100%)",
          pointerEvents: "none", zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
              Why <span className="gradient-text">PayShield</span>?
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto" }}>
              Built on Ethereum with IPFS storage. Everything is verifiable, decentralized, and trustless.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24 }}>
            {FEATURES.map(f => (
              <div
                key={f.title}
                style={{
                  background: "rgba(14,18,30,0.82)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(99,102,241,0.14)",
                  borderRadius: 16,
                  padding: 28,
                  transition: "border-color 0.3s, box-shadow 0.3s",
                  cursor: "default"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                  e.currentTarget.style.boxShadow = "0 0 32px rgba(99,102,241,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.14)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className={`stat-icon ${f.color}`} style={{ marginBottom: 20 }}>
                  <f.icon size={22} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS — Interactive Stepper
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "100px 60px",
        background: "rgba(255,255,255,0.015)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
              How It Works
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-secondary)" }}>
              From wallet connect to payment release — fully on-chain.
            </p>
          </div>

          <HowItWorksStepper />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 60px", textAlign: "center" }}>
        <div style={{
          maxWidth: 600, margin: "0 auto",
          background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(59,130,246,0.08))",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 24, padding: "56px 40px"
        }}>
          <CheckCircle size={44} style={{ color: "var(--accent-green)", marginBottom: 20 }} />
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 14 }}>Ready to get started?</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.7 }}>
            Join hundreds of freelancers and clients already using PayShield
            for secure, trustless cross-border payments.
          </p>
          <button
            id="btn-cta-launch"
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/login")}
            style={{ width: "100%" }}
          >
            <Shield size={18} /> Launch PayShield App
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 60px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
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
