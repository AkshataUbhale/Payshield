import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, History, ExternalLink } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/common/NotificationBell";
import WalletCard from "../components/wallet/WalletCard";
import TransactionItem from "../components/wallet/TransactionItem";
import { useWallet } from "../hooks/useWallet";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Demo transactions — will be replaced by real chain data once Solana watcher is enabled
const DEMO_TXS = [
  { type:"credit", label:"Payment Received",  amount:"500",  status:"Confirmed", timestamp:"Aug 18, 2026 · 10:24 AM", txHash:"5JUeA2KQm3fFxwJL4Y8K3L9Nk7Pkp2RFkKr9WTmb4CX" },
  { type:"debit",  label:"Escrow Locked",      amount:"1200", status:"Confirmed", timestamp:"Aug 17, 2026 · 3:00 PM",  txHash:"3mJQyKxV1nL4Pg2RFkCr9WTaU5JeA8YK3L9Nk7Pb4CX" },
  { type:"credit", label:"Dispute Refund",     amount:"200",  status:"Confirmed", timestamp:"Aug 15, 2026 · 1:45 PM",  txHash:"8WTaU5Je3mJQyKxA2KV1nL4Pg2RFkCr9b4CXL9Nk7P" },
  { type:"debit",  label:"Contract Created",   amount:"350",  status:"Pending",   timestamp:"Aug 14, 2026 · 11:30 AM", txHash:null },
];

export default function WalletPage() {
  const navigate = useNavigate();
  const { publicKey, connected, shortAddress } = useWallet();

  const address = publicKey ? publicKey.toBase58() : null;
  const displayAddr = shortAddress || address;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Wallet</span>
            <span className="topbar-breadcrumb">Your Solana wallet &amp; balances</span>
          </div>
          <div className="topbar-right"><NotificationBell /></div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems:"start" }}>
            {/* Left: wallet card + actions */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {/* Connect prompt */}
              {!connected && (
                <div style={{
                  background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.2)",
                  borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", gap:14
                }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600 }}>Connect your wallet</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)" }}>Connect Phantom or Solflare to see live info</div>
                  </div>
                  <WalletMultiButton style={{ height:36, borderRadius:8, fontFamily:"Inter,sans-serif", fontSize:13 }} />
                </div>
              )}

              <WalletCard
                balance={connected ? "Live — check Phantom" : "—"}
                network="Solana Devnet"
                address={address || "Not connected"}
              />

              {/* Actions */}
              <div className="grid-2">
                <button className="btn btn-primary btn-lg" style={{ width:"100%", flexDirection:"column", height:72, gap:4 }}>
                  <ArrowUp size={18} /> Deposit
                </button>
                <button className="btn btn-ghost btn-lg" style={{ width:"100%", flexDirection:"column", height:72, gap:4 }}>
                  <ArrowDown size={18} /> Withdraw
                </button>
              </div>

              {/* Network info */}
              <div className="card card-sm">
                <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:600, letterSpacing:0.5, marginBottom:14 }}>
                  NETWORK INFO
                </div>
                {[
                  { label:"Network",      value:"Solana Devnet" },
                  { label:"Token",        value:"SOL / USDC (SPL)" },
                  { label:"Transaction Fee", value:"~$0.0001" },
                  { label:"Est. Confirm", value:"< 1 second" },
                ].map(r => (
                  <div key={r.label} className="flex-between" style={{ padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>{r.label}</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>{r.value}</span>
                  </div>
                ))}

                {address && (
                  <div style={{ marginTop:14 }}>
                    <a
                      href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:12, color:"var(--accent-purple)", display:"flex", alignItems:"center", gap:5 }}
                    >
                      <ExternalLink size={12} /> View on Solana Explorer
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right: recent transactions */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize:16, fontWeight:700 }}>Recent Transactions</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/transactions")}>
                  <History size={13} /> All History
                </button>
              </div>
              {DEMO_TXS.map((tx, i) => <TransactionItem key={i} tx={tx} />)}
              <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:14, textAlign:"center" }}>
                Live on-chain history coming once Solana watcher is enabled
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
