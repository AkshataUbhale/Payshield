import { Wallet, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

export default function WalletCard({ balance, network = "Polygon", address }) {
  const [copied, setCopied] = useState(false);

  const copyAddr = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.1))",
      border: "1px solid rgba(99,102,241,0.25)",
      borderRadius: 16,
      padding: "24px 28px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 120, height: 120,
        background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg,#6366f1,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Wallet size={18} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Wallet Balance</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 6px rgba(16,185,129,0.6)" }} />
            <span style={{ fontSize: 11, color: "var(--accent-green)", fontWeight: 600 }}>{network}</span>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div style={{
        fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif",
        background: "linear-gradient(135deg,#a5b4fc,#60a5fa)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 4
      }}>
        {balance} USDC
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        ≈ ${parseFloat(balance || 0).toFixed(2)} USD
      </div>

      {/* Address */}
      {address && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            flex: 1, fontSize: 12, fontFamily: "'Courier New',monospace",
            color: "var(--text-muted)", padding: "6px 10px",
            background: "rgba(255,255,255,0.04)", borderRadius: 8,
            border: "1px solid var(--border)"
          }}>
            {address.slice(0,10)}…{address.slice(-6)}
          </div>
          <button
            onClick={copyAddr}
            style={{
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 8, padding: "6px 10px", cursor: "pointer",
              color: copied ? "var(--accent-green)" : "var(--accent-purple)", fontSize: 12
            }}
          >
            <Copy size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
