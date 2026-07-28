import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { Shield, FileText, CheckCircle, Clock, AlertCircle, ArrowLeft, Calendar, User, DollarSign } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/common/NotificationBell';

export default function ContractDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { shortAddr } = useWallet();
  const navigate = useNavigate();
  const [status, setStatus] = useState('ACTIVE');
  const [wallet] = useState("0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12");

  // Mock data
  const contract = {
    id: id,
    title: 'Smart Contract Development for DeFi Protocol',
    clientName: 'DeFi Labs',
    freelancerName: 'Alex.eth',
    amount: '15,000 USDC',
    totalMilestones: 3,
    completedMilestones: 1,
    status: status, // ACTIVE, PENDING_APPROVAL, COMPLETED, DISPUTED
    createdAt: '2026-03-01',
    deadline: '2026-04-15'
  };

  const isClient = user?.role === 'client';

  return (
    <div className="app-layout">
      <Sidebar walletAddress={wallet} />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ padding: "8px" }}>
              <ArrowLeft size={16} />
            </button>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="topbar-title">Contract Escrow Details</span>
              <span className="topbar-breadcrumb">ID: {id} • Decentralized Escrow Node</span>
            </div>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <div className="wallet-badge" onClick={() => navigate("/wallet")}>
              <div className="wallet-dot" />
              {shortAddr || `${wallet.slice(0,6)}...${wallet.slice(-4)}`}
            </div>
          </div>
        </div>

        <div className="page-container">
          <div className="flex-between mb-6">
            <div>
              <span className="badge badge-completed" style={{ fontSize: 12, padding: "6px 14px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                SOLANA ESCROW PROGRAM
              </span>
            </div>
            <span className={`badge ${
              status === 'ACTIVE' ? 'badge-active' :
              status === 'COMPLETED' ? 'badge-completed' :
              'badge-pending'
            }`} style={{ fontSize: 13, padding: "6px 14px", textTransform: "uppercase" }}>
              {status}
            </span>
          </div>

          <div className="grid-3">
            <div className="col-span-2" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Overview Card */}
              <div className="card">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <FileText size={18} style={{ color: "var(--accent-purple)" }} /> Overview
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Project Title</label>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>{contract.title}</p>
                  </div>
                  <div className="divider" style={{ margin: "12px 0" }}></div>
                  <div className="grid-2">
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                        <User size={12} /> Client
                      </label>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{contract.clientName}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                        <User size={12} /> Freelancer
                      </label>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{contract.freelancerName}</p>
                    </div>
                  </div>
                  <div className="divider" style={{ margin: "12px 0" }}></div>
                  <div className="grid-2">
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={12} /> Start Date
                      </label>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>{contract.createdAt}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={12} /> Deadline
                      </label>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>{contract.deadline}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones Card */}
              <div className="card">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle size={18} style={{ color: "var(--accent-green)" }} /> Milestones & Deliverables
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[1, 2, 3].map((m) => (
                    <div key={m} className="milestone-item" style={{
                      padding: 16,
                      background: m === 1 ? "rgba(16, 185, 129, 0.04)" : "rgba(255, 255, 255, 0.01)",
                      border: m === 1 ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid var(--border)",
                      borderRadius: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      borderBottom: m === 1 ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid var(--border)"
                    }}>
                      <div className="flex-between">
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Milestone {m}: Delivery #{m}</h3>
                        <span style={{ fontWeight: 700, color: "var(--accent-purple)" }}>5,000 USDC</span>
                      </div>
                      <div className="flex-between" style={{ fontSize: 13 }}>
                        <span style={{ color: "var(--text-muted)" }}>Due: 2026-03-{m * 10}</span>
                        {m === 1 ? (
                          <span style={{ color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                            <CheckCircle size={14} /> Completed
                          </span>
                        ) : m === 2 && contract.status === 'ACTIVE' ? (
                          <span style={{ color: "var(--accent-amber)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                            <Clock size={14} /> In Progress
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <FileText size={14} /> Pending Lockup
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Stats & Escrow Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="card" style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.03))",
                borderColor: "rgba(99, 102, 241, 0.25)",
                boxShadow: "var(--shadow-glow)"
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
                  <Shield size={22} style={{ color: "var(--accent-purple)" }} />
                  <h2 style={{ fontSize: 18, fontWeight: 700 }}>Escrow Node</h2>
                </div>

                <div style={{
                  textAlign: "center",
                  padding: 24,
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  marginBottom: 24
                }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Locked Balance</p>
                  <p style={{ fontSize: 32, fontWeight: 800, color: "var(--accent-purple)", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <DollarSign size={24} style={{ color: "var(--accent-purple)" }} /> {contract.amount.split(" ")[0]}
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}> USDC</span>
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {!isClient && status === 'ACTIVE' && (
                    <button
                      onClick={() => navigate('/submit')}
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                    >
                      Submit Deliverable
                    </button>
                  )}

                  {isClient && status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => setStatus('COMPLETED')}
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                    >
                      Approve & Release Funds
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/dispute')}
                    className="btn btn-danger"
                    style={{ width: "100%" }}
                  >
                    <AlertCircle size={15} /> File Program Dispute
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
