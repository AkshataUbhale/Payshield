import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, History, ExternalLink } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/common/NotificationBell";
import WalletCard from "../components/wallet/WalletCard";
import TransactionItem from "../components/wallet/TransactionItem";
import { useWallet } from "../hooks/useWallet";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import * as api from "../services/api";

export default function WalletPage() {
  const navigate = useNavigate();
  const { publicKey, connected, shortAddress, connection } = useWallet();
  const [solBalance, setSolBalance] = useState("0.00");
  const [usdcBalance, setUsdcBalance] = useState("0.00");
  const [recentTxs, setRecentTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [airdropping, setAirdropping] = useState(false);
  const [airdropMsg, setAirdropMsg] = useState("");

  const address = publicKey ? publicKey.toBase58() : null;
  const displayAddr = shortAddress || address;

  // 1. Fetch live SOL balance
  const fetchBalance = async () => {
    if (!publicKey || !connection) {
      setSolBalance("0.00");
      return;
    }
    try {
      const lamports = await connection.getBalance(publicKey);
      setSolBalance((lamports / 1e9).toFixed(3));
    } catch (err) {
      console.warn("Could not fetch Solana balance via RPC:", err.message);
      // Fallback via backend endpoint
      if (address) {
        api.getSolanaBalance(address)
          .then((res) => setSolBalance(String(res.balance || "0.00")))
          .catch(() => {});
      }
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connection, address]);

  // 2. Airdrop handler
  const handleAirdrop = async () => {
    if (!publicKey || !connection) return;
    setAirdropping(true);
    setAirdropMsg("");
    try {
      const sig = await connection.requestAirdrop(publicKey, 1e9); // 1 SOL
      await connection.confirmTransaction(sig, "confirmed");
      setAirdropMsg("✅ Successfully airdropped 1 SOL on Devnet!");
      await fetchBalance();
    } catch (err) {
      console.error("Airdrop failed:", err);
      setAirdropMsg("⚠️ Airdrop rate limited. Try using the Solana CLI or faucet.solana.com");
    } finally {
      setAirdropping(false);
      setTimeout(() => setAirdropMsg(""), 5000);
    }
  };

  // 3. Load transactions
  useEffect(() => {
    async function loadTxs() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        if (!token) return;
        const res = await api.getContracts({}, token);
        const contracts = Array.isArray(res) ? res : res.contracts || [];

        let totalEarned = 0;
        const txList = [];
        contracts.forEach((p) => {
          if (p.status === "completed") {
            totalEarned += Number(p.budget) || 0;
            txList.push({
              type: p.freelancerPubkey === address ? "credit" : "debit",
              label: `${p.title} — Payment Released`,
              amount: String(p.budget),
              status: "Confirmed",
              timestamp: new Date(p.updatedAt || p.createdAt).toLocaleString(),
              txHash: p.txSignature || p.escrowPda || "Solana Devnet",
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
        setUsdcBalance(totalEarned.toFixed(2));
        setRecentTxs(txList.slice(0, 5));
      } catch (err) {
        console.error("Failed to load wallet transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTxs();
  }, [address]);

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
          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Left: wallet card + actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Connect prompt */}
              {!connected && (
                <div style={{
                  background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Connect your wallet</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Connect Phantom or Solflare to see live info</div>
                  </div>
                  <WalletMultiButton style={{ height: 36, borderRadius: 8, fontFamily: "Inter,sans-serif", fontSize: 13 }} />
                </div>
              )}

              {airdropMsg && (
                <div style={{
                  padding: "10px 14px",
                  background: airdropMsg.includes("Successfully") ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                  border: airdropMsg.includes("Successfully") ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(245,158,11,0.3)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: airdropMsg.includes("Successfully") ? "#6ee7b7" : "#fde68a"
                }}>
                  {airdropMsg}
                </div>
              )}

              <WalletCard
                balance={usdcBalance}
                solBalance={solBalance}
                network="Solana Devnet"
                address={address || "Not connected"}
                onAirdrop={handleAirdrop}
                airdropping={airdropping}
              />

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
                  { label: "Network",         value: "Solana Devnet" },
                  { label: "Token",           value: "SOL / USDC (SPL)" },
                  { label: "Transaction Fee", value: "~$0.0001" },
                  { label: "Est. Confirm",    value: "< 1 second" },
                ].map(r => (
                  <div key={r.label} className="flex-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}

                {address && (
                  <div style={{ marginTop: 14 }}>
                    <a
                      href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "var(--accent-purple)", display: "flex", alignItems: "center", gap: 5 }}
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
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Transactions</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/transactions")}>
                  <History size={13} /> All History
                </button>
              </div>

              {loading ? (
                <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
                  Loading transactions...
                </div>
              ) : recentTxs.length === 0 ? (
                <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem", fontSize: 13 }}>
                  No transactions yet. Create or complete an escrow contract to see activity here.
                </div>
              ) : (
                recentTxs.map((tx, i) => <TransactionItem key={i} tx={tx} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
