import { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  AlertTriangle, Clock, CheckCircle, MessageSquare,
  FileText, Shield, ChevronDown, ChevronUp, Send
} from "lucide-react";

const EXISTING_DISPUTES = [
  {
    id: "D-001",
    contract: "SEO Audit & Strategy",
    freelancer: "0x6g7h...8i9j",
    amount: 300,
    status: "Under Review",
    openedAt: "Mar 11, 2025",
    issue: "Client claims deliverables don't match scope. Freelancer disputes this assessment.",
    messages: [
      { from:"Client",     text:"The audit report only covers 3 pages, not the full website as agreed.",     time:"Mar 11, 14:22" },
      { from:"Freelancer", text:"I covered all pages listed in the original brief. Please check Appendix B.", time:"Mar 11, 16:05" },
      { from:"Arbitrator", text:"We are reviewing the original contract terms and submitted evidence.",        time:"Mar 12, 09:10" },
    ]
  }
];

const CONTRACTS = [
  { id: 1, title:"Logo & Brand Identity",      amount:200 },
  { id: 2, title:"Smart Contract Development", amount:800 },
  { id: 4, title:"Mobile App UI Design",       amount:450 },
  { id: 5, title:"SEO Audit & Strategy",       amount:300 },
];

export default function DisputeCenter() {
  const [expanded, setExpanded] = useState("D-001");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]   = useState({ contract:"", issue:"", evidence:"", expectedOutcome:"" });

  const set = (k,v) => setForm(prev => ({...prev,[k]:v}));

  const handleSubmit = () => {
    if (!form.contract || !form.issue) {
      alert("Please select a contract and describe your issue."); return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 2000);
  };

  return (
    <div className="app-layout">
      <Sidebar walletAddress="0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12" />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Dispute Center</span>
            <span className="topbar-breadcrumb">Dashboard / Dispute Center</span>
          </div>
          <div className="topbar-right">
            <button
              id="btn-raise-dispute-topbar"
              className="btn btn-danger btn-sm"
              onClick={() => { setShowForm(true); setSubmitted(false); }}
            >
              <AlertTriangle size={14}/> Raise Dispute
            </button>
          </div>
        </div>

        <div className="page-container">
          {/* Banner */}
          <div style={{
            background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)",
            borderRadius:14, padding:"18px 24px",
            display:"flex", alignItems:"flex-start", gap:14, marginBottom:28
          }}>
            <Shield size={20} style={{ color:"var(--accent-red)", flexShrink:0, marginTop:1 }} />
            <div>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>On-Chain Dispute Resolution</div>
              <div style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6 }}>
                Disputes are handled by a neutral on-chain arbitrator. All evidence is stored on IPFS.
                Funds remain locked in escrow until a resolution is reached. Cases typically resolve in 3–5 business days.
              </div>
            </div>
          </div>

          {/* Existing disputes */}
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>Your Active Disputes</h2>

            {EXISTING_DISPUTES.length === 0 ? (
              <div className="card" style={{ textAlign:"center", padding:48 }}>
                <CheckCircle size={40} style={{ color:"var(--accent-green)", margin:"0 auto 16px", display:"block" }} />
                <div style={{ fontWeight:600, marginBottom:6 }}>No active disputes</div>
                <div style={{ fontSize:13, color:"var(--text-muted)" }}>Great! All your contracts are running smoothly.</div>
              </div>
            ) : (
              EXISTING_DISPUTES.map(d => (
                <div key={d.id} className="dispute-card">
                  <div
                    className="flex-between"
                    style={{ cursor:"pointer" }}
                    onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                  >
                    <div className="flex gap-3" style={{ alignItems:"center" }}>
                      <div style={{
                        width:36, height:36, borderRadius:10,
                        background:"rgba(239,68,68,0.12)",
                        display:"flex", alignItems:"center", justifyContent:"center"
                      }}>
                        <AlertTriangle size={16} style={{ color:"var(--accent-red)" }} />
                      </div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700 }}>{d.contract}</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>#{d.id} · Opened {d.openedAt}</div>
                      </div>
                    </div>
                    <div className="flex gap-3" style={{ alignItems:"center" }}>
                      <span style={{ fontSize:16, fontWeight:700, color:"var(--accent-red)" }}>{d.amount} USDC</span>
                      <span className="badge badge-disputed">{d.status}</span>
                      {expanded === d.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </div>
                  </div>

                  {expanded === d.id && (
                    <div style={{ marginTop:20, paddingTop:20, borderTop:"1px solid rgba(239,68,68,0.15)" }}>
                      <div style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:20 }}>
                        {d.issue}
                      </div>

                      {/* Messages */}
                      <div style={{ fontWeight:700, fontSize:13, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                        <MessageSquare size={14}/> Dispute Thread
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                        {d.messages.map((m,i) => (
                          <div key={i} style={{
                            background:"rgba(0,0,0,0.2)",
                            border:`1px solid ${
                              m.from === "Arbitrator" ? "rgba(99,102,241,0.2)"
                              : m.from === "Client"   ? "rgba(59,130,246,0.15)"
                              : "rgba(16,185,129,0.15)"
                            }`,
                            borderRadius:10, padding:"12px 16px"
                          }}>
                            <div className="flex-between" style={{ marginBottom:6 }}>
                              <span style={{
                                fontSize:12, fontWeight:700,
                                color: m.from === "Arbitrator" ? "var(--accent-purple)"
                                     : m.from === "Client"     ? "var(--accent-blue)"
                                     : "var(--accent-green)"
                              }}>{m.from}</span>
                              <span style={{ fontSize:11, color:"var(--text-muted)" }}>
                                <Clock size={10} style={{ display:"inline", marginRight:3 }} />{m.time}
                              </span>
                            </div>
                            <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6 }}>{m.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Reply */}
                      <div style={{ display:"flex", gap:10 }}>
                        <input
                          className="form-input"
                          placeholder="Add a message to the dispute thread…"
                          style={{ flex:1 }}
                        />
                        <button className="btn btn-secondary">
                          <Send size={14}/> Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Raise Dispute Form */}
          {(showForm || EXISTING_DISPUTES.length === 0) && !submitted && (
            <div className="card animate-fadeInUp" id="dispute-form">
              <h2 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>
                <AlertTriangle size={18} style={{ display:"inline", marginRight:8, color:"var(--accent-red)", verticalAlign:"middle" }} />
                Raise a New Dispute
              </h2>
              <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:24, lineHeight:1.6 }}>
                Raising a dispute will freeze the escrow funds and notify both parties. A neutral arbitrator will review the evidence.
              </p>

              <div className="form-group">
                <label className="form-label">Affected Contract *</label>
                <select id="input-dispute-contract" className="form-select"
                  value={form.contract} onChange={e => set("contract", e.target.value)}>
                  <option value="">Select a contract</option>
                  {CONTRACTS.map(c => (
                    <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dispute Type</label>
                <select id="input-dispute-type" className="form-select">
                  <option>Work not delivered as agreed</option>
                  <option>Deliverable quality issue</option>
                  <option>Contract scope disagreement</option>
                  <option>Payment not released after approval</option>
                  <option>Communication breakdown</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Describe the Issue *</label>
                <textarea
                  id="input-dispute-issue"
                  className="form-textarea"
                  style={{ minHeight:140 }}
                  placeholder="Explain what happened, what was agreed, and what is disputed…"
                  value={form.issue}
                  onChange={e => set("issue", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Evidence / IPFS Links</label>
                <textarea
                  id="input-dispute-evidence"
                  className="form-textarea"
                  style={{ minHeight:80 }}
                  placeholder="Paste any IPFS hashes, links, or evidence references…"
                  value={form.evidence}
                  onChange={e => set("evidence", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Outcome</label>
                <select id="input-dispute-outcome" className="form-select"
                  value={form.expectedOutcome} onChange={e => set("expectedOutcome", e.target.value)}>
                  <option value="">Select outcome</option>
                  <option>Full refund to client</option>
                  <option>Partial refund / milestone split</option>
                  <option>Payment released to freelancer</option>
                  <option>Contract renegotiation</option>
                </select>
              </div>

              <div style={{
                display:"flex", justifyContent:"flex-end", gap:12, marginTop:8
              }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button
                  id="btn-submit-dispute"
                  className="btn btn-danger"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? <><span className="spinner"/> Submitting…</> : <><AlertTriangle size={15}/> Submit Dispute</>}
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {submitted && (
            <div className="card animate-fadeInUp" style={{ textAlign:"center", padding:48 }}>
              <div style={{
                width:64, height:64, borderRadius:"50%",
                background:"rgba(245,158,11,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 20px"
              }}>
                <FileText size={30} style={{ color:"var(--accent-amber)" }} />
              </div>
              <h2 style={{ fontSize:22, fontWeight:800, color:"var(--accent-amber)", marginBottom:8 }}>
                Dispute Submitted
              </h2>
              <p style={{ color:"var(--text-secondary)", lineHeight:1.7, maxWidth:480, margin:"0 auto 28px" }}>
                Your dispute has been registered on-chain. Escrow funds are now frozen.
                An arbitrator will review the case within 3–5 business days.
              </p>
              <div style={{
                display:"inline-block",
                background:"rgba(0,0,0,0.2)", border:"1px solid var(--border)",
                borderRadius:12, padding:"12px 20px",
                fontSize:14, fontWeight:600, color:"var(--accent-amber)",
                marginBottom:24
              }}>
                Case ID: #D-{String(Math.floor(Math.random()*900)+100)}
              </div>
              <br/>
              <button className="btn btn-ghost" onClick={() => setSubmitted(false)}>
                Return to Dispute Center
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
