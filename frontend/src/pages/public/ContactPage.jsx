import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SoftAurora from "../../components/SoftAurora";
import {
  Shield, Mail, MapPin, Phone, MessageSquare, Send,
  ChevronDown, ChevronUp, Check, ExternalLink, Globe, Lock
} from "lucide-react";

export default function ContactPage() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Copy state
  const [copiedText, setCopiedText] = useState(null);

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setFormSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const FAQS = [
    {
      q: "How does PayShield escrow secure payments?",
      a: "PayShield deploys a secure on-chain escrow smart contract. The client locks funds in the contract, and they are only released to the freelancer once deliverables are reviewed and approved, or after arbitration determines settlement."
    },
    {
      q: "Which blockchain networks does PayShield support?",
      a: "PayShield currently operates on the ultra-fast Solana network, offering near-zero network fees (less than $0.01 per transaction) and sub-second confirmation times."
    },
    {
      q: "What are the protocol fees?",
      a: "Unlike traditional freelance platforms that charge 10% to 20% fees, PayShield charges a minimal protocol fee of only 0.5% per completed contract milestone to maintain on-chain routing."
    },
    {
      q: "How does the AI Arbitrator work in case of a dispute?",
      a: "When a dispute is raised, the AI Arbitrator takes all secure project metadata, IPFS file hashes, chat history, and milestone conditions as inputs to synthesize a fair, objective settlement recommendation within minutes."
    }
  ];

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
            style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", transition: "color 0.2s" }}
            onClick={() => navigate("/about")}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            About
          </span>
          <span
            style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", cursor: "pointer", borderBottom: "2px solid #6366f1", paddingBottom: 4 }}
            onClick={() => navigate("/contact")}
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
          color1="#00DFD8"
          color2="#3b82f6"
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

      {/* ── Main Container ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "120px 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header Hero */}
        <div style={{ textAlign: "center", marginBottom: 70 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,223,216,0.1)", border: "1px solid rgba(0,223,216,0.25)",
            borderRadius: 20, padding: "6px 16px", marginBottom: 20,
            fontSize: 12, fontWeight: 600, color: "var(--accent-cyan)"
          }}>
            <MessageSquare size={13} />
            Support Available 24/7
          </div>
          
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900, letterSpacing: "-1.5px",
            lineHeight: 1.1, marginBottom: 20,
            color: "#ffffff"
          }}>
            Get in <span style={{
              background: "linear-gradient(135deg, #00DFD8 0%, #3b82f6 50%, #6366f1 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>Touch</span>
          </h1>
          <p style={{
            fontSize: 18, color: "var(--text-secondary)",
            maxWidth: 700, lineHeight: 1.7, margin: "0 auto", opacity: 0.9
          }}>
            Have questions about PayShield escrow structures, Solana integration, or AI disputes? Submit a message below or contact us directly.
          </p>
        </div>

        {/* 2-Column Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, marginBottom: 80, alignItems: "start" }}>
          
          {/* Left Column: Glassmorphism Form */}
          <div style={{
            background: "rgba(18, 22, 40, 0.45)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 24, padding: 40,
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0, width: 200, height: 200,
              background: "radial-gradient(circle,rgba(0,223,216,0.08),transparent 75%)", pointerEvents: "none"
            }} />

            {formSubmitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.15)",
                  color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px"
                }}>
                  <Check size={32} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Message Dispatched!</h3>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 360, margin: "0 auto 24px" }}>
                  Thanks for reaching out. A PayShield protocol support representative will review your message and respond within 12 hours.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Send us a Message</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Satoshi Nakamoto"
                    style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12, padding: "12px 16px", color: "white", outline: "none", fontSize: 14,
                      transition: "all 0.3s ease"
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "#00DFD8";
                      e.target.style.background = "rgba(0,223,216,0.02)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "rgba(255,255,255,0.06)";
                      e.target.style.background = "rgba(255,255,255,0.03)";
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="satoshi@bitcoin.org"
                    style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12, padding: "12px 16px", color: "white", outline: "none", fontSize: 14,
                      transition: "all 0.3s ease"
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "#00DFD8";
                      e.target.style.background = "rgba(0,223,216,0.02)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "rgba(255,255,255,0.06)";
                      e.target.style.background = "rgba(255,255,255,0.03)";
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Your Message</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we assist you with our smart escrow framework?"
                    style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12, padding: "14px 16px", color: "white", outline: "none", fontSize: 14,
                      fontFamily: "inherit", resize: "none", lineHeight: 1.6, transition: "all 0.3s ease"
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "#00DFD8";
                      e.target.style.background = "rgba(0,223,216,0.02)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "rgba(255,255,255,0.06)";
                      e.target.style.background = "rgba(255,255,255,0.03)";
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: "linear-gradient(135deg,#00DFD8,#3b82f6)",
                    border: "none", borderRadius: 12, color: "white", fontWeight: 700,
                    padding: "14px 24px", cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 10, transition: "all 0.3s ease",
                    boxShadow: "0 4px 16px rgba(0,223,216,0.25)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,223,216,0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,223,216,0.25)";
                  }}
                >
                  {submitting ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      <Send size={16} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Dynamic Info Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                icon: Mail, label: "Email Support", value: "support@payshield.app",
                desc: "Typical response within 12 hours", actionLabel: "Copy Email", color: "cyan"
              },
              {
                icon: MessageSquare, label: "Live Discord Chat", value: "discord.gg/payshield",
                desc: "Connect with the community directly", actionLabel: "Join Server", color: "blue", link: "https://discord.gg"
              },
              {
                icon: MapPin, label: "Office Address", value: "123 Blockchain Ave, Suite 400",
                desc: "San Francisco, CA 94107", actionLabel: "View on Map", color: "purple"
              },
              {
                icon: Phone, label: "Phone Hotline", value: "+1 (555) 123-4567",
                desc: "Mon - Fri, 9am - 6pm PST", actionLabel: "Call Support", color: "green"
              }
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(18, 22, 40, 0.45)", backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "24px 28px",
                  display: "flex", gap: 20, alignItems: "center", transition: "all 0.3s ease", cursor: "default"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.borderColor = "rgba(0,223,216,0.25)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,223,216,0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: card.color === "cyan" ? "rgba(0,223,216,0.12)" : card.color === "blue" ? "rgba(59,130,246,0.12)" : card.color === "purple" ? "rgba(99,102,241,0.12)" : "rgba(16,185,129,0.12)",
                  color: card.color === "cyan" ? "#00DFD8" : card.color === "blue" ? "#3b82f6" : card.color === "purple" ? "#6366f1" : "#10b981",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <card.icon size={22} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.5 }}>{card.label}</span>
                  <div style={{ fontSize: 15, fontWeight: 800, margin: "2px 0", color: "#ffffff" }}>{card.value}</div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{card.desc}</span>
                </div>

                <button
                  onClick={() => {
                    if (card.link) {
                      window.open(card.link, "_blank");
                    } else if (card.actionLabel === "Copy Email") {
                      handleCopy(card.value, "email");
                    } else if (card.actionLabel === "Call Support") {
                      window.open("tel:" + card.value.replace(/[^0-9+]/g, ""));
                    } else {
                      window.open("https://maps.google.com/?q=" + encodeURIComponent(card.value), "_blank");
                    }
                  }}
                  style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, color: "white",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  {copiedText === "email" && card.actionLabel === "Copy Email" ? (
                    <>
                      <Check size={11} color="#10b981" /> Copied!
                    </>
                  ) : (
                    <>
                      {card.actionLabel} <ExternalLink size={11} />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* ── FAQ Section ── */}
        <div style={{ maxWidth: 800, margin: "100px auto 0" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
              Quick insights on how PayShield secures transaction mechanics.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  style={{
                    background: "rgba(18, 22, 40, 0.45)", backdropFilter: "blur(20px)",
                    border: `1px solid ${isOpen ? "rgba(0,223,216,0.3)" : "rgba(255,255,255,0.05)"}`,
                    borderRadius: 16, overflow: "hidden", transition: "all 0.3s ease",
                    boxShadow: isOpen ? "0 4px 20px rgba(0,223,216,0.08)" : "none"
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    style={{
                      width: "100%", padding: "24px 28px", background: "none", border: "none",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      textAlign: "left", cursor: "pointer", color: "white"
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700, paddingRight: 20 }}>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} style={{ color: "#00DFD8" }} /> : <ChevronDown size={18} style={{ color: "var(--text-muted)" }} />}
                  </button>
                  
                  {isOpen && (
                    <div style={{
                      padding: "0 28px 24px", fontSize: 14, color: "var(--text-secondary)",
                      lineHeight: 1.6, borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: 16
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
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
