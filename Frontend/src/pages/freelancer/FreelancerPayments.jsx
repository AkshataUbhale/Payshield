import { useNavigate } from "react-router-dom";
import { TrendingUp, DollarSign, History, ArrowRight } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import EarningsChart from "../../components/dashboard/EarningsChart";
import TransactionItem from "../../components/wallet/TransactionItem";
import { useWallet } from "../../hooks/useWallet";

const PAYMENTS = [
  { type: "credit", label: "React Dashboard — TechCorp Inc.", amount: "500", status: "Confirmed", timestamp: "Mar 13, 2026" },
  { type: "credit", label: "Solidity Audit — DeFi Labs",      amount: "1200", status: "Confirmed", timestamp: "Mar 5, 2026" },
  { type: "credit", label: "UI Mockups — StartupHQ",          amount: "350",  status: "Pending",   timestamp: "Mar 1, 2026" },
  { type: "credit", label: "ML Pipeline — AI Research Ltd.",  amount: "800",  status: "Confirmed", timestamp: "Feb 20, 2026" },
];

const CHART = [
  { month: "Oct", amount: 800 }, { month: "Nov", amount: 1200 }, { month: "Dec", amount: 950 },
  { month: "Jan", amount: 1600 }, { month: "Feb", amount: 1100 }, { month: "Mar", amount: 1800 },
];

export default function FreelancerPayments() {
  const navigate = useNavigate();
  const { balance } = useWallet();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Payments</span>
            <span className="topbar-breadcrumb">Your earnings & payout history</span>
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
              { label: "Available Balance",   value: `${balance || "420"} USDC`, color: "purple" },
              { label: "This Month",          value: "$1,800",                   color: "green" },
              { label: "Lifetime Earnings",   value: "$7,380",                   color: "blue" },
              { label: "Pending Payouts",     value: "350 USDC",                 color: "amber" },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Earnings Chart */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Earnings Trend</h2>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Last 6 months</span>
              </div>
              <EarningsChart data={CHART} />
            </div>

            {/* Payment History */}
            <div className="card">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Payment History</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/transactions")}>
                  Full History <ArrowRight size={12} />
                </button>
              </div>
              {PAYMENTS.map((p, i) => <TransactionItem key={i} tx={p} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
