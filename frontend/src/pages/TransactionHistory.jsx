import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/common/NotificationBell";
import TransactionItem from "../components/wallet/TransactionItem";
import { useWallet } from "../hooks/useWallet";
import * as api from "../services/api";

export default function TransactionHistory() {
  const { publicKey } = useWallet();
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        const res = await api.getContracts({}, token);
        const contracts = Array.isArray(res) ? res : res.contracts || [];

        const txList = [];
        contracts.forEach((p) => {
          if (p.status === "completed") {
            txList.push({
              type: p.freelancerPubkey === publicKey ? "credit" : "debit",
              label: `${p.title} (Released)`,
              amount: String(p.budget),
              status: "Confirmed",
              timestamp: new Date(p.updatedAt || p.createdAt).toLocaleString(),
              txHash: p.txSignature || "Solana Devnet Confirmed",
            });
          } else if (p.status === "in_progress") {
            txList.push({
              type: "debit",
              label: `Escrow Locked — ${p.title}`,
              amount: String(p.budget),
              status: "Confirmed",
              timestamp: new Date(p.createdAt).toLocaleString(),
              txHash: p.escrowPda || p.txSignature || "PDA Locked",
            });
          }
        });
        setTransactions(txList);
      } catch (err) {
        console.error("Failed to load transaction history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, [publicKey]);

  const filtered = transactions.filter((tx) =>
    filter === "all" ? true : filter === "in" ? tx.type === "credit" : tx.type === "debit"
  );

  const totalIn = transactions
    .filter((t) => t.type === "credit")
    .reduce((a, t) => a + parseFloat(t.amount || 0), 0);
  const totalOut = transactions
    .filter((t) => t.type === "debit")
    .reduce((a, t) => a + parseFloat(t.amount || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Transaction History</span>
            <span className="topbar-breadcrumb">All live on-chain Solana escrow activity</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div className="page-container">
          {/* Summary */}
          <div className="grid-2 mb-8" style={{ maxWidth: 500 }}>
            <div className="stat-card green">
              <div className="stat-value" style={{ fontSize: 22, color: "var(--accent-green)" }}>
                +{totalIn} USDC
              </div>
              <div className="stat-label">Total Received</div>
            </div>
            <div className="stat-card amber">
              <div className="stat-value" style={{ fontSize: 22 }}>
                {totalOut} USDC
              </div>
              <div className="stat-label">Total Sent / Locked</div>
            </div>
          </div>

          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              gap: 0,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              padding: 3,
              marginBottom: 20,
              maxWidth: 280,
            }}
          >
            {[
              ["all", "All"],
              ["in", "Received"],
              ["out", "Sent / Locked"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: filter === k ? "linear-gradient(135deg,#6366f1,#3b82f6)" : "transparent",
                  color: filter === k ? "white" : "var(--text-muted)",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="card">
            {loading ? (
              <div style={{ color: "var(--text-muted)", padding: "1.5rem", textAlign: "center" }}>
                Loading live on-chain transactions...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>
                No transactions recorded yet. Create or complete an escrow contract to see activity.
              </div>
            ) : (
              filtered.map((tx, i) => <TransactionItem key={i} tx={tx} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
