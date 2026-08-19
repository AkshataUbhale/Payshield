import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, DollarSign, History, ArrowRight } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import EarningsChart from "../../components/dashboard/EarningsChart";
import TransactionItem from "../../components/wallet/TransactionItem";
import { useWallet } from "../../hooks/useWallet";
import * as api from "../../services/api";

export default function FreelancerPayments() {
  const navigate = useNavigate();
  const { shortAddress, publicKey } = useWallet();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    lifetimeEarnings: 0,
    thisMonth: 0,
    pendingPayouts: 0,
  });

  useEffect(() => {
    async function loadPaymentData() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        const res = await api.getContracts({}, token);
        const contracts = Array.isArray(res) ? res : res.contracts || [];

        // Filter projects assigned to this freelancer
        const myProjects = contracts.filter(
          (c) => c.freelancerPubkey === publicKey || c.status === "completed"
        );

        let lifetime = 0;
        let pending = 0;
        const txList = [];

        myProjects.forEach((p) => {
          if (p.status === "completed") {
            lifetime += Number(p.budget) || 0;
            txList.push({
              type: "credit",
              label: `${p.title} (Payout)`,
              amount: `${p.budget}`,
              status: "Confirmed",
              timestamp: new Date(p.updatedAt || p.createdAt).toLocaleDateString(),
            });
          } else if (p.status === "in_progress") {
            pending += Number(p.budget) || 0;
            txList.push({
              type: "credit",
              label: `${p.title} (Escrow Locked)`,
              amount: `${p.budget}`,
              status: "Pending",
              timestamp: new Date(p.createdAt).toLocaleDateString(),
            });
          }
        });

        setPayments(txList);
        setStats({
          lifetimeEarnings: lifetime,
          thisMonth: lifetime,
          pendingPayouts: pending,
        });
      } catch (err) {
        console.error("Failed to load freelancer payments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPaymentData();
  }, [publicKey]);

  const chartData = [
    { month: "Current", amount: stats.lifetimeEarnings }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Payments</span>
            <span className="topbar-breadcrumb">Your live earnings & payout history</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/wallet")}>
              <History size={14} /> Wallet
            </button>
          </div>
        </div>

        <div className="page-container">
          {/* Stats */}
          <div className="grid-4 mb-8">
            {[
              { label: "Connected Wallet", value: shortAddress || "Not connected", color: "purple" },
              { label: "This Month", value: `$${stats.thisMonth}`, color: "green" },
              { label: "Lifetime Earnings", value: `$${stats.lifetimeEarnings}`, color: "blue" },
              { label: "Pending in Escrow", value: `${stats.pendingPayouts} USDC`, color: "amber" },
            ].map((s) => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Earnings Chart */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Earnings Trend</h2>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Live Real-Time Data</span>
              </div>
              <EarningsChart data={chartData} />
            </div>

            {/* Payment History */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Payment History</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/transactions")}>
                  Full History <ArrowRight size={12} />
                </button>
              </div>
              {loading ? (
                <div style={{ color: "var(--text-muted)", padding: "1rem" }}>Loading payments...</div>
              ) : payments.length === 0 ? (
                <div style={{ color: "var(--text-muted)", padding: "1.5rem 0", textAlign: "center" }}>
                  No transaction history found yet. Complete a project milestone to see payouts.
                </div>
              ) : (
                payments.map((p, i) => <TransactionItem key={i} tx={p} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
