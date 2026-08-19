import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  AlertTriangle, Clock, CheckCircle, MessageSquare,
  FileText, Shield, ChevronDown, ChevronUp, Send
} from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { raiseDisputeOnChain } from "../services/solanaWeb3";
import { getContracts, createDispute, getDisputes } from "../services/api";

export default function DisputeCenter() {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const [disputes, setDisputes]   = useState([]);
  const [contracts, setContracts] = useState([]);
  const [expanded, setExpanded]   = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState("");
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [form, setForm] = useState({ contract:"", issue:"", evidence:"", expectedOutcome:"" });

  const set = (k, v) => setForm(prev => ({...prev, [k]: v}));

  // Load real disputes and contracts from backend
  useEffect(() => {
    async function loadData() {
      setFetching(true);
      const token = sessionStorage.getItem("ps_token");
      try {
        const disputeData = await getDisputes(token);
        const list = Array.isArray(disputeData) ? disputeData : [];
        setDisputes(list);
        if (list.length > 0) setExpanded(list[0]._id || list[0].id);
      } catch (err) {
        console.error("Failed to load disputes:", err);
        setDisputes([]);
      }

      try {
        const contractData = await getContracts({}, token);
        const list = Array.isArray(contractData) ? contractData : (contractData.projects || contractData.contracts || []);
        setContracts(list);
      } catch (err) {
        console.error("Failed to load contracts:", err);
        setContracts([]);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!form.contract || !form.issue) {
      alert("Please select a contract and describe your issue.");
      return;
    }
    setLoading(true);
    try {
      if (connected && publicKey) {
        const wallet = { publicKey, signTransaction, signAllTransactions };
        await raiseDisputeOnChain(wallet, form.contract, form.issue);
      }
      const token = sessionStorage.getItem("ps_token");
      const res = await createDispute(
        {
          contractId: form.contract,
          issue: form.issue,
          evidence: form.evidence,
          expectedOutcome: form.expectedOutcome,
        },
        token
      );
      setSubmittedCaseId(res.disputeId || res._id || `DISP-${Date.now()}`);
      setSubmitted(true);
      // Refresh disputes list
      const updated = await getDisputes(token);
      setDisputes(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to raise dispute. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Dispute Center</span>
            <span className="topbar-breadcrumb">Escrow Dispute Mediation & AI Arbitration</span>
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
          {/* Dispute List */}
          <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:28 }}>
            {fetching ? (
              <div className="card text-center" style={{ color:"var(--text-muted)", padding:"2rem" }}>
                Loading dispute records...
              </div>
            ) : disputes.length === 0 ? (
              <div className="card text-center" style={{ padding:"3rem" }}>
                <Shield size={40} style={{ margin:"0 auto 12px", color:"var(--accent-green)" }} />
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>Zero Active Disputes</h3>
                <p style={{ color:"var(--text-muted)", fontSize:14, maxWidth:420, margin:"0 auto 20px" }}>
                  All your escrow contracts are operating normally with zero contested milestones.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)}>
                  <AlertTriangle size={13} /> Open Dispute Ticket
                </button>
              </div>
            ) : (
              disputes.map(d => {
                const isExp = expanded === (d._id || d.id);
                const dispId = d._id || d.id;
                return (
                  <div key={dispId} className="card" style={{ cursor:"pointer" }}
                    onClick={() => setExpanded(isExp ? null : dispId)}>
                    <div className="flex-between">
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{
                          width:36, height:36, borderRadius:8,
                          background:"rgba(239,68,68,0.12)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color:"var(--accent-red)"
                        }}>
                          <AlertTriangle size={18}/>
                        </div>
                        <div>
                          <div style={{ fontSize:15, fontWeight:700 }}>
                            {d.contractTitle || d.contractId || `Dispute #${dispId}`}
                          </div>
                          <div style={{ fontSize:12, color:"var(--text-muted)" }}>
                            Opened: {new Date(d.createdAt || Date.now()).toLocaleDateString()} · Expected: {d.expectedOutcome || "Mediation"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span className="badge badge-amber">{d.status || "Under Review"}</span>
                        {isExp ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </div>
                    </div>

                    {isExp && (
                      <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
                        <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6, marginBottom:16 }}>
                          <strong>Claim:</strong> {d.issue}
                        </p>
                        {d.evidence && (
                          <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:16 }}>
                            <strong>Evidence IPFS/Links:</strong> {d.evidence}
                          </p>
                        )}
                        {d.ruling && (
                          <div style={{
                            background: "rgba(99,102,241,0.08)",
                            border: "1px solid rgba(99,102,241,0.2)",
                            borderRadius: 10,
                            padding: 14,
                            marginBottom: 16
                          }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-purple)", marginBottom: 4 }}>
                              ⚖️ AI Arbitration Ruling:
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
                              {d.ruling}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Raise Dispute Form */}
          {showForm && !submitted && (
            <div className="card animate-fadeInUp" id="dispute-form">
              <h2 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>
                <AlertTriangle size={18} style={{ display:"inline", marginRight:8, color:"var(--accent-red)", verticalAlign:"middle" }} />
                Raise a New Dispute
              </h2>
              <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:24, lineHeight:1.6 }}>
                Raising a dispute freezes the Solana escrow funds and invokes the AI Arbitration Oracle to evaluate contract terms.
              </p>

              <div className="form-group">
                <label className="form-label">Affected Contract / Job *</label>
                <select
                  id="input-dispute-contract"
                  className="form-select"
                  value={form.contract}
                  onChange={e => set("contract", e.target.value)}
                >
                  <option value="">Select a contract</option>
                  {contracts.map(c => {
                    const cid = c.projectId || c._id;
                    return (
                      <option key={cid} value={cid}>
                        {c.title} (#{cid})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Describe the Issue *</label>
                <textarea
                  id="input-dispute-issue"
                  className="form-textarea"
                  style={{ minHeight:120 }}
                  placeholder="Explain what happened, what was agreed, and why funds should be arbitrated…"
                  value={form.issue}
                  onChange={e => set("issue", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Evidence / IPFS Hashes</label>
                <textarea
                  id="input-dispute-evidence"
                  className="form-textarea"
                  style={{ minHeight:80 }}
                  placeholder="Paste any IPFS hashes, GitHub PR links, or commit references…"
                  value={form.evidence}
                  onChange={e => set("evidence", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Outcome</label>
                <select
                  id="input-dispute-outcome"
                  className="form-select"
                  value={form.expectedOutcome}
                  onChange={e => set("expectedOutcome", e.target.value)}
                >
                  <option value="">Select expected outcome</option>
                  <option value="Full refund to client">Full refund to client</option>
                  <option value="Partial refund / milestone split">Partial refund / milestone split</option>
                  <option value="Payment released to freelancer">Payment released to freelancer</option>
                </select>
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:8 }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button
                  id="btn-submit-dispute"
                  className="btn btn-danger"
                  disabled={loading || !form.contract || !form.issue}
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
                Your dispute has been registered. Escrow funds are frozen and submitted to the AI Arbitration Oracle.
              </p>
              <div style={{
                display:"inline-block",
                background:"rgba(0,0,0,0.2)", border:"1px solid var(--border)",
                borderRadius:12, padding:"12px 20px",
                fontSize:14, fontWeight:600, color:"var(--accent-amber)",
                marginBottom:24
              }}>
                Case ID: {submittedCaseId}
              </div>
              <br/>
              <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setShowForm(false); }}>
                Return to Dispute Center
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
