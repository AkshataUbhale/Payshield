import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";

export default function TransactionItem({ tx }) {
  const { type, amount, status, txHash, timestamp, label } = tx;
  const isOut = type === "debit" || type === "locked";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 0", borderBottom: "1px solid var(--border)"
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: isOut ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {isOut
          ? <ArrowUpRight size={16} style={{ color: "var(--accent-red)" }} />
          : <ArrowDownLeft size={16} style={{ color: "var(--accent-green)" }} />
        }
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{label || type}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{timestamp}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: isOut ? "var(--accent-red)" : "var(--accent-green)"
        }}>
          {isOut ? "-" : "+"}{amount} USDC
        </div>
        <div style={{ fontSize: 11, color: status === "Confirmed" ? "var(--accent-green)" : "var(--accent-amber)" }}>
          {status}
        </div>
      </div>
      {txHash && (
        <a
          href={`https://polygonscan.com/tx/${txHash}`}
          target="_blank" rel="noreferrer"
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
        >
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}
