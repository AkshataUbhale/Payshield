import { Wallet, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

export default function WalletCard({
  balance = "0.00",
  solBalance = "0.00",
  network = "Solana Devnet",
  address,
  onAirdrop,
  airdropping = false
}) {
  const [copied, setCopied] = useState(false);

  const copyAddr = () => {
    if (address && address !== "Not connected") {
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
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 140, height: 140,
        background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />

      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)"
          }}>
            <Wallet size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Wallet Balance</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 6px rgba(16,185,129,0.6)" }} />
              <span style={{ fontSize: 11, color: "var(--accent-green)", fontWeight: 600 }}>{network}</span>
            </div>
          </div>
        </div>

        {onAirdrop && address && address !== "Not connected" && (
          <button
            id="btn-request-airdrop"
            className="btn btn-secondary btn-sm"
            onClick={onAirdrop}
            disabled={airdropping}
            style={{ fontSize: 11, padding: "4px 10px" }}
          >
            {airdropping ? <span className="spinner" /> : "🪂 Request 1 SOL"}
          </button>
        )}
      </div>

      {/* Balance */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <div style={{
          fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif",
          background: "linear-gradient(135deg,#a5b4fc,#60a5fa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {solBalance} SOL
        </div>
        <div style={{ fontSize: 14, color: "var(--accent-green)", fontWeight: 600 }}>
          ({balance} USDC)
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        ≈ ${(parseFloat(solBalance || 0) * 170 + parseFloat(balance || 0)).toFixed(2)} USD Estimated
      </div>

      {/* Address */}
      {address && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            flex: 1, fontSize: 12, fontFamily: "'Courier New',monospace",
            color: "var(--text-secondary)", padding: "8px 12px",
            background: "rgba(255,255,255,0.04)", borderRadius: 8,
            border: "1px solid var(--border)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {address}
          </div>
          <button
            id="btn-copy-address"
            onClick={copyAddr}
            title={copied ? "Copied!" : "Copy Full Address"}
            style={{
              background: copied ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.15)",
              border: copied ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(99,102,241,0.3)",
              borderRadius: 8, padding: "8px 12px", cursor: "pointer",
              color: copied ? "var(--accent-green)" : "var(--accent-purple)", fontSize: 12,
              display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s ease"
            }}
          >
            <Copy size={13} />
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
