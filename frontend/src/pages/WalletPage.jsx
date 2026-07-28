import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, Wallet, Plus, Minus, History } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/common/NotificationBell";
import WalletCard from "../components/wallet/WalletCard";
import TransactionItem from "../components/wallet/TransactionItem";
import { useWallet } from "../hooks/useWallet";

const RECENT_TXS = [
  { type: "credit", label: "Payment Received", amount: "500", status: "Confirmed", timestamp: "Mar 13, 2026 · 10:24 AM",
    txHash: "0xabc123def456" },
  { type: "debit",  label: "Escrow Locked", amount: "1200", status: "Confirmed", timestamp: "Mar 12, 2026 · 3:00 PM",
    txHash: "0xdef456abc789" },
  { type: "credit", label: "Dispute Refund", amount: "200", status: "Confirmed", timestamp: "Mar 10, 2026 · 1:45 PM",
    txHash: "0x789abc123def" },
  { type: "debit",  label: "Contract Created", amount: "350", status: "Pending", timestamp: "Mar 9, 2026 · 11:30 AM",
    txHash: null },
];

export default function WalletPage() {
  const navigate = useNavigate();
  const { address, balance, network, connected, connect } = useWallet();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Wallet</span>
            <span className="topbar-breadcrumb">Your crypto wallet & balances</span>
          </div>
          <div className="topbar-right"><NotificationBell /></div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Left: wallet card + actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Connect prompt */}
              {!connected && (
                <div style={{
                  background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14
                }}>
                  <Wallet size={22} style={{ color: "var(--accent-purple)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Connect your wallet</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Link MetaMask to see live balance</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={connect}>Connect</button>
                </div>
              )}

              <WalletCard balance={balance || "420.50"} network={network} address={address || "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12"} />

              {/* Actions */}
              <div className="grid-2">
                <button className="btn btn-primary btn-lg" style={{ width: "100%", flexDirection: "column", height: 72, gap: 4 }}>
                  <ArrowUp size={18} /> Deposit
                </button>
                <button className="btn btn-ghost btn-lg" style={{ width: "100%", flexDirection: "column", height: 72, gap: 4 }}>
                  <ArrowDown size={18} /> Withdraw
                </button>
              </div>

              {/* Network info */}
              <div className="card card-sm">
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5, marginBottom: 14 }}>
                  NETWORK INFO
                </div>
                {[
                  { label: "Network", value: "Polygon Mainnet" },
                  { label: "Token", value: "USDC (ERC-20)" },
                  { label: "Gas Fee", value: "~$0.001" },
                  { label: "Est. Confirm", value: "< 2 seconds" },
                ].map(r => (
                  <div key={r.label} className="flex-between" style={{
                    padding: "8px 0", borderBottom: "1px solid var(--border)"
                  }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: recent transactions */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Transactions</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/transactions")}>
                  <History size={13} /> All History
                </button>
              </div>
              {RECENT_TXS.map((tx, i) => <TransactionItem key={i} tx={tx} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
