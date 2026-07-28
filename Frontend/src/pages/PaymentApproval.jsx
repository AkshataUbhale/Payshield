import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { CheckCircle, XCircle, Download, Hash, Eye, Clock, Shield } from "lucide-react";

const PENDING_APPROVALS = [
  {
    id: 2,
    title: "Smart Contract Development",
    freelancer: "0x5e6f...7a8b",
    amount: 800,
    currency: "USDC",
    ipfsHash: "QmXz7rNkwPLp8kHBFtMbv3QJ5xRuY9WcNdTq2eMfA6yGz4",
    submittedAt: "Mar 12, 2025 — 14:30 UTC",
    milestone: "Testing & Deployment",
    files: [
      { name: "Escrow.sol", size: "4.2 KB", type: "Solidity" },
      { name: "Dispute.sol", size: "2.8 KB", type: "Solidity" },
      { name: "test_report.pdf", size: "1.1 MB", type: "PDF" },
      { name: "deploy_scripts.zip", size: "18 KB", type: "Archive" },
    ],
    note: "All three contracts deployed to Sepolia testnet. Test coverage at 97%. Hardhat deployment scripts included."
  },
  {
    id: 4,
    title: "Mobile App UI Design",
    freelancer: "0x2c3d...4e5f",
    amount: 450,
    currency: "USDC",
    ipfsHash: "QmBq3RsT8uVwXYZ5k9mNpL2jFhCdE7aGiAoW4rKeMvPxH1",
    submittedAt: "Mar 11, 2025 — 09:15 UTC",
    milestone: "Figma Prototypes",
    files: [
      { name: "payshield_app_figma.fig", size: "14.5 MB", type: "Figma" },
      { name: "design_system.pdf", size: "3.2 MB", type: "PDF" },
    ],
    note: "Complete Figma file with 28 screens, auto-layout components, and exported assets."
  }
];

export default function PaymentApproval() {
  const [selected, setSelected] = useState(PENDING_APPROVALS[0]);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [completed, setCompleted] = useState([]);

  const handleAction = (action) => {
    setLoading(action);
    setTimeout(() => {
      setLoading(false);
      setResult({ action, contract: selected });
      setCompleted(prev => [...prev, selected.id]);
    }, 2000);
  };

  const pending = PENDING_APPROVALS.filter(c => !completed.includes(c.id));

  if (result) {
    return (
      <div className="app-layout">
        <Sidebar walletAddress="0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12" />
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-left">
              <span className="topbar-title">Payment Approval</span>
              <span className="topbar-breadcrumb">Dashboard / Approve Payment</span>
            </div>
          </div>
          <div className="page-container" style={{ maxWidth:700 }}>
            <div className="card animate-fadeInUp" style={{ textAlign:"center", padding:52 }}>
              {result.action === "approve" ? (
                <>
                  <div style={{
                    width:72, height:72, borderRadius:"50%",
                    background:"rgba(16,185,129,0.15)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    margin:"0 auto 20px"
                  }}>
                    <CheckCircle size={36} color="var(--accent-green)" />
                  </div>
                  <h2 style={{ fontSize:24, fontWeight:800, color:"var(--accent-green)", marginBottom:8 }}>
                    Payment Released! 🎉
                  </h2>
                  <p style={{ color:"var(--text-secondary)", marginBottom:28, lineHeight:1.7 }}>
                    <strong style={{ color:"var(--accent-green)" }}>{result.contract.amount} {result.contract.currency}</strong>{" "}
                    has been released from escrow to the freelancer's wallet on-chain.
                  </p>
                  <div className="hash-box" style={{ justifyContent:"center", marginBottom:28, fontSize:13 }}>
                    <Hash size={13}/> Tx Hash: 0x3f5a...9d1b (Ethereum Mainnet)
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    width:72, height:72, borderRadius:"50%",
                    background:"rgba(239,68,68,0.15)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    margin:"0 auto 20px"
                  }}>
                    <XCircle size={36} color="var(--accent-red)" />
                  </div>
                  <h2 style={{ fontSize:24, fontWeight:800, color:"var(--accent-red)", marginBottom:8 }}>
                    Work Rejected
                  </h2>
                  <p style={{ color:"var(--text-secondary)", marginBottom:28, lineHeight:1.7 }}>
                    The submission for <strong>{result.contract.title}</strong> has been rejected.
                    Funds remain locked in escrow. The freelancer has been notified.
                  </p>
                </>
              )}
              <button
                id="btn-review-more"
                className="btn btn-secondary"
                onClick={() => { setResult(null); setSelected(PENDING_APPROVALS[0]); }}
              >
                Review More Submissions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar walletAddress="0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12" />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Payment Approval</span>
            <span className="topbar-breadcrumb">Dashboard / Approve Payment</span>
          </div>
          <div className="topbar-right">
            <span style={{
              background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.25)",
              color:"var(--accent-amber)", fontSize:12, fontWeight:600,
              padding:"6px 12px", borderRadius:8
            }}>
              {pending.length} Awaiting Review
            </span>
          </div>
        </div>

        <div className="page-container">
          {pending.length === 0 ? (
            <div className="card" style={{ textAlign:"center", padding:64 }}>
              <CheckCircle size={48} style={{ color:"var(--accent-green)", margin:"0 auto 20px", display:"block" }} />
              <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>All caught up!</div>
              <div style={{ color:"var(--text-muted)" }}>No submissions awaiting your review.</div>
            </div>
          ) : (
            <div className="grid-2" style={{ alignItems:"flex-start" }}>
              {/* Left: List */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {pending.map(c => (
                  <div
                    key={c.id}
                    id={`approval-card-${c.id}`}
                    className="card card-sm"
                    style={{
                      cursor:"pointer",
                      border:`1px solid ${selected?.id === c.id ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
                      background: selected?.id === c.id ? "rgba(99,102,241,0.06)" : "var(--bg-card)"
                    }}
                    onClick={() => setSelected(c)}
                  >
                    <div className="flex-between" style={{ marginBottom:8 }}>
                      <div style={{ fontSize:14, fontWeight:700 }}>{c.title}</div>
                      <span className="badge badge-submitted">Submitted</span>
                    </div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:6 }}>
                      <Clock size={11} style={{ display:"inline", marginRight:4 }} />
                      {c.submittedAt}
                    </div>
                    <div style={{ fontSize:16, fontWeight:700, color:"var(--accent-green)" }}>
                      {c.amount} {c.currency}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Detail */}
              {selected && (
                <div className="card animate-fadeIn">
                  <h2 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>{selected.title}</h2>
                  <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:20 }}>
                    <Clock size={11} style={{ display:"inline", marginRight:4 }} />
                    Submitted {selected.submittedAt}
                  </div>

                  {/* Info grid */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
                    {[
                      { l:"Freelancer", v:selected.freelancer, mono:true },
                      { l:"Amount",     v:`${selected.amount} ${selected.currency}`, bold:true, green:true },
                      { l:"Milestone",  v:selected.milestone },
                    ].map(({l,v,mono,bold,green}) => (
                      <div key={l}>
                        <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:3 }}>{l.toUpperCase()}</div>
                        <div style={{
                          fontSize:13,
                          fontFamily: mono ? "'Courier New',monospace" : "inherit",
                          fontWeight: bold ? 700 : 500,
                          color: green ? "var(--accent-green)" : "var(--text-secondary)"
                        }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* IPFS Hash */}
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:8 }}>
                      <Hash size={11} style={{ display:"inline", marginRight:4 }} />IPFS DELIVERABLE HASH
                    </div>
                    <div className="hash-box" style={{ fontSize:11 }}>
                      <Hash size={12}/> {selected.ipfsHash}
                    </div>
                  </div>

                  {/* Files */}
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:10 }}>
                      ATTACHED FILES ({selected.files.length})
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {selected.files.map((f,i) => (
                        <div key={i} style={{
                          display:"flex", alignItems:"center", gap:12,
                          padding:"10px 14px",
                          background:"rgba(255,255,255,0.03)",
                          border:"1px solid var(--border)",
                          borderRadius:10
                        }}>
                          <Download size={14} style={{ color:"var(--text-muted)" }} />
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:600 }}>{f.name}</div>
                            <div style={{ fontSize:11, color:"var(--text-muted)" }}>{f.type} · {f.size}</div>
                          </div>
                          <button style={{
                            background:"none", border:"none", cursor:"pointer",
                            color:"var(--accent-purple)", fontSize:12, fontWeight:600,
                            display:"flex", alignItems:"center", gap:4
                          }}>
                            <Eye size={13}/> View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  <div style={{
                    background:"rgba(255,255,255,0.02)", border:"1px solid var(--border)",
                    borderRadius:10, padding:"14px 16px", marginBottom:24
                  }}>
                    <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:8 }}>
                      FREELANCER NOTE
                    </div>
                    <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7 }}>{selected.note}</p>
                  </div>

                  {/* Actions */}
                  <div style={{ display:"flex", gap:12 }}>
                    <button
                      id="btn-approve-payment"
                      className="btn btn-success"
                      style={{ flex:1, height:46 }}
                      onClick={() => handleAction("approve")}
                      disabled={!!loading}
                    >
                      {loading === "approve" ? (
                        <><span className="spinner" /> Processing…</>
                      ) : (
                        <><CheckCircle size={16}/> Release Payment</>
                      )}
                    </button>
                    <button
                      id="btn-reject-payment"
                      className="btn btn-danger"
                      style={{ flex:1, height:46 }}
                      onClick={() => handleAction("reject")}
                      disabled={!!loading}
                    >
                      {loading === "reject" ? (
                        <><span className="spinner" /> Processing…</>
                      ) : (
                        <><XCircle size={16}/> Reject Work</>
                      )}
                    </button>
                  </div>

                  <div style={{
                    display:"flex", alignItems:"center", gap:6,
                    marginTop:14, fontSize:12, color:"var(--text-muted)"
                  }}>
                    <Shield size={12}/> Funds are locked in escrow and will only move upon your action.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
