import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, ArrowRight } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "../../hooks/useWallet";

export default function Signup() {
  const navigate = useNavigate();
  const { connected } = useWallet();

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-primary)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative"
    }}>
      <div style={{ position:"fixed",top:"-20%",left:"-10%",width:500,height:500,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)",pointerEvents:"none" }} />

      <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}
        style={{ position: "fixed", top: 20, left: 20 }}>
        <ArrowLeft size={14} /> Home
      </button>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#6366f1,#3b82f6)",
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",
            boxShadow:"0 8px 24px rgba(99,102,241,0.4)" }}>
            <Shield size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Join PayShield</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Web3 Decentralized Escrow Platform</p>
        </div>

        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Connect Solana Wallet</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
            Connect your Phantom or Solflare wallet to start working or hiring with escrow protection.
          </p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }} className="solana-auth-button-container">
            <WalletMultiButton style={{
              width: "100%", height: 46, justifyContent: "center",
              borderRadius: 10, fontFamily: "Inter,sans-serif", fontSize: 14, fontWeight: 600
            }} />
          </div>

          {connected && (
            <button
              className="btn btn-primary"
              style={{ width: "100%", height: 44, marginTop: 10 }}
              onClick={() => navigate("/onboarding/role")}
            >
              Proceed to Role Selection <ArrowRight size={15} />
            </button>
          )}

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            Already connected?{" "}
            <span style={{ color: "var(--accent-purple)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => navigate("/login")}>Sign in with Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}
