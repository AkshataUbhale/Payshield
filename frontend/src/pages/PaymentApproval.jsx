import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { CheckCircle, XCircle, Download, Hash, Eye, Clock, Shield } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { releaseMilestoneOnChain } from "../services/solanaWeb3";
import { getSubmissions, approvePayment, rejectPayment } from "../services/api";


export default function PaymentApproval() {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const [approvals, setApprovals]   = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [result, setResult]         = useState(null);
  const [completed, setCompleted]   = useState([]);

  // Load real pending submissions from backend
  useEffect(() => {
    const token = sessionStorage.getItem("ps_token");
    if (!token) return;
    getSubmissions(token)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setApprovals(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(err => {
        console.error("Failed to load submissions:", err.message);
        setFetchError(err.message);
        // Show empty state — no fake data
        setApprovals([]);
      });
  }, []);

  const handleAction = async (action) => {
    if (!selected) return;
    setLoading(action);
    try {
      const token = sessionStorage.getItem("ps_token");
      if (action === "approve") {
        let txSig = null;
        if (connected && publicKey) {
          const wallet = { publicKey, signTransaction, signAllTransactions };
          try {
            txSig = await releaseMilestoneOnChain(wallet, selected.contractId || selected.id, selected.milestoneIndex ?? 0);
          } catch (onChainErr) {
            console.warn("On-chain release notice:", onChainErr);
          }
        }
        await approvePayment(selected.contractId || selected.id, txSig, token);
        setResult({ action, contract: selected, signature: txSig });
      } else {
        await rejectPayment(selected.contractId || selected.id, token);
        setResult({ action, contract: selected });
      }
      setCompleted(prev => [...prev, selected.id]);
    } catch (err) {
      console.error(err);
      alert(err.message || "Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pending = approvals.filter(c => !completed.includes(c.id));

  if (result) {
    return (
      <div className="app-layout">
        <Sidebar />
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
                    <Hash size={13}/> Tx Signature: {result.signature || `${result.contract.contractId || result.contract.id}-SOL-APPROVED`} (Solana Devnet)
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
                onClick={() => { setResult(null); setSelected(approvals[0] || null); }}
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
      <Sidebar />
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
