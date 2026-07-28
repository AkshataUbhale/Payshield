import { useState } from "react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/common/NotificationBell";
import TransactionItem from "../components/wallet/TransactionItem";

const ALL_TXS = [
  { type: "credit", label: "Payment Received — React Dashboard",   amount: "500",  status: "Confirmed", timestamp: "Mar 13, 2026 · 10:24 AM", txHash: "0xabc12" },
  { type: "debit",  label: "Escrow Locked — Solidity Contract",    amount: "1200", status: "Confirmed", timestamp: "Mar 12, 2026 · 3:00 PM",  txHash: "0xdef45" },
  { type: "credit", label: "Dispute Refund — SEO Audit",           amount: "200",  status: "Confirmed", timestamp: "Mar 10, 2026 · 1:45 PM",  txHash: "0x789ab" },
  { type: "debit",  label: "Contract Created — UI Mockups",        amount: "350",  status: "Pending",   timestamp: "Mar 9, 2026 · 11:30 AM",  txHash: null     },
  { type: "credit", label: "Payment Released — ML Pipeline",       amount: "800",  status: "Confirmed", timestamp: "Mar 5, 2026 · 4:10 PM",   txHash: "0xcde78" },
  { type: "debit",  label: "Escrow Locked — DevOps Setup",         amount: "900",  status: "Confirmed", timestamp: "Mar 3, 2026 · 9:00 AM",   txHash: "0xef901" },
  { type: "credit", label: "Payment Received — Content Writing",   amount: "120",  status: "Confirmed", timestamp: "Feb 28, 2026 · 2:30 PM",  txHash: "0x12345" },
];

export default function TransactionHistory() {
  const [filter, setFilter] = useState("all");
  const filtered = ALL_TXS.filter(tx =>
    filter === "all" ? true : filter === "in" ? tx.type === "credit" : tx.type === "debit"
  );

  const totalIn  = ALL_TXS.filter(t => t.type === "credit").reduce((a, t) => a + parseFloat(t.amount), 0);
  const totalOut = ALL_TXS.filter(t => t.type === "debit").reduce((a,  t) => a + parseFloat(t.amount), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Transaction History</span>
            <span className="topbar-breadcrumb">All on-chain activity</span>
          </div>
          <div className="topbar-right"><NotificationBell /></div>
        </div>

        <div className="page-container">
          {/* Summary */}
          <div className="grid-2 mb-8" style={{ maxWidth: 500 }}>
            <div className="stat-card green">
              <div className="stat-value" style={{ fontSize: 22, color: "var(--accent-green)" }}>+{totalIn} USDC</div>
              <div className="stat-label">Total Received</div>
            </div>
            <div className="stat-card amber">
              <div className="stat-value" style={{ fontSize: 22 }}>{totalOut} USDC</div>
              <div className="stat-label">Total Sent / Locked</div>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, marginBottom: 20, maxWidth: 280 }}>
            {[["all","All"],["in","Received"],["out","Sent"]].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                flex: 1, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: filter === k ? "linear-gradient(135deg,#6366f1,#3b82f6)" : "transparent",
                color: filter === k ? "white" : "var(--text-muted)"
              }}>{l}</button>
            ))}
          </div>

          <div className="card">
            {filtered.map((tx, i) => <TransactionItem key={i} tx={tx} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
