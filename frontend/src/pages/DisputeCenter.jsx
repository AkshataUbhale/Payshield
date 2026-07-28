import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";
import { WalletContext } from "../context/WalletContext";
import * as api from "../services/api";
import bs58 from "bs58";
import {
  AlertTriangle, Clock, CheckCircle, MessageSquare,
  FileText, Shield, ChevronDown, ChevronUp, Send, Bot, User, Scale, Activity
} from "lucide-react";

export default function DisputeCenter() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { address, wallet, signMessage } = useContext(WalletContext);
  
  const [disputes, setDisputes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({ 
    projectId: "", 
    milestoneIndex: 0, 
    issue: "", 
    evidence: "" 
  });
  
  const [newMessage, setNewMessage] = useState("");
  const [arbitrating, setArbitrating] = useState(false);
  const [overrideData, setOverrideData] = useState({ freelancerSplit: 50, clientSplit: 50, comments: "" });
  const [showOverride, setShowOverride] = useState(false);

  // Load disputes on mount
  useEffect(() => {
    fetchDisputes();
  }, [user]);

  const fetchDisputes = async () => {
    try {
      const token = sessionStorage.getItem("ps_user") ? JSON.parse(sessionStorage.getItem("ps_user")).token : null;
      // Fetch disputes
      const data = await api.getDisputes(token);
      setDisputes(data);
      if (data.length > 0 && !expanded) {
        setExpanded(data[0].disputeId);
      }
    } catch (err) {
      console.error("Failed to load disputes:", err);
      // Fallback mock if server offline
      setDisputes([
        {
          disputeId: "D-927361",
          projectId: "P-101",
          milestoneIndex: 0,
          raisedBy: "Client",
          issue: "Logo deliverables do not match design constraints. The resolution is too low.",
          evidence: "https://ipfs.io/ipfs/QmXyZ1...",
          status: "under_review",
          messages: [
            { sender: "System", text: "Dispute raised. AI Arbitrator assigned.", timestamp: new Date() },
            { sender: "Client", text: "I requested vectors but received small PNG files.", timestamp: new Date() },
          ],
          auditLog: ["Dispute registered on-chain", "AI Arbitrator initialized"]
        }
      ]);
    }
  };

  const handleCreateDispute = async () => {
    if (!form.projectId || !form.issue) {
      alert("Please enter a project ID and describe the issue.");
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem("ps_user") ? JSON.parse(sessionStorage.getItem("ps_user")).token : null;
      const res = await api.raiseDispute(form, token);
      setSubmitted(true);
      setShowForm(false);
      fetchDisputes();
    } catch (err) {
      alert("Failed to raise dispute: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (disputeId) => {
    if (!newMessage.trim()) return;
    try {
      const token = sessionStorage.getItem("ps_user") ? JSON.parse(sessionStorage.getItem("ps_user")).token : null;
      
      let signatureStr = null;
      let pubKeyStr = null;

      // Ask connected Phantom/Solflare wallet to sign the message
      if (signMessage && address) {
        try {
          const encoder = new TextEncoder();
          const messageBytes = encoder.encode(newMessage);
          const signatureBytes = await signMessage(messageBytes);
          signatureStr = bs58.encode(signatureBytes);
          pubKeyStr = address;
        } catch (sigErr) {
          console.warn("Wallet signing skipped or rejected:", sigErr);
        }
      }

      await api.addDisputeMsg(disputeId, newMessage, signatureStr, pubKeyStr, token);
      setNewMessage("");
      fetchDisputes();
    } catch (err) {
      alert("Failed to send message: " + err.message);
    }
  };

  const handleOpenArbitrator = (disputeObj) => {
    if (user?.role === "client") {
      navigate("/client-arbitrator", { state: { dispute: disputeObj } });
    } else {
      navigate("/freelancer-arbitrator", { state: { dispute: disputeObj } });
    }
  };

  const handleTriggerAI = async (disputeId) => {
    setArbitrating(true);
    try {
      const token = sessionStorage.getItem("ps_user") ? JSON.parse(sessionStorage.getItem("ps_user")).token : null;
      await api.arbitrateDispute(disputeId, token);
      fetchDisputes();
    } catch (err) {
      alert("AI arbitration failed: " + err.message);
    } finally {
      setArbitrating(false);
    }
  };

  const handleManualOverride = async (disputeId) => {
    try {
      const token = sessionStorage.getItem("ps_user") ? JSON.parse(sessionStorage.getItem("ps_user")).token : null;
      await api.manualOverrideDispute(
        disputeId, 
        overrideData.freelancerSplit, 
        overrideData.clientSplit, 
        overrideData.comments, 
        token
      );
      setShowOverride(false);
      fetchDisputes();
    } catch (err) {
      alert("Manual override failed: " + err.message);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar walletAddress={address} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Dispute Center & AI Arbitrator</span>
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
            background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(99,102,241,0.05))",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: 16, padding: "20px 24px",
            display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28
          }}>
            <Shield size={24} style={{ color: "var(--accent-red)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span>Autonomous AI & Manual Fallback Arbitration</span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                  background: "rgba(99,102,241,0.15)", color: "#a5b4fc"
                }}>ACTIVE</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Disputes freeze the on-chain Solana escrow milestone. Our neural AI Arbitrator automatically scans the 
                milestone parameters, chat history, and IPFS deliverables to suggest an equitable fund release. 
                Admins retain manual override capabilities if exceptional edge cases arise.
              </div>
            </div>
          </div>

          {/* Active disputes */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your Active Disputes</h2>

            {disputes.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 48 }}>
                <CheckCircle size={40} style={{ color: "var(--accent-green)", margin: "0 auto 16px", display: "block" }} />
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No active disputes</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Great! All your contracts are running smoothly.</div>
              </div>
            ) : (
              disputes.map(d => (
                <div key={d.disputeId} className="dispute-card" style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16, padding: 20, marginBottom: 16
                }}>
                  <div
                    className="flex-between"
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpanded(expanded === d.disputeId ? null : d.disputeId)}
                  >
                    <div className="flex gap-3" style={{ alignItems: "center" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: "rgba(239,68,68,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <AlertTriangle size={18} style={{ color: "var(--accent-red)" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Project #{d.projectId}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Case {d.disputeId} · Milestone Index {d.milestoneIndex}</div>
                      </div>
                    </div>
                    <div className="flex gap-3" style={{ alignItems: "center" }}>
                      <span className={`badge ${d.status.includes("resolved") ? "badge-success" : "badge-disputed"}`}>
                        {d.status.toUpperCase().replace(/_/g, " ")}
                      </span>
                      {expanded === d.disputeId ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </div>
                  </div>

                  {expanded === d.disputeId && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      
                      {/* Description & Evidence */}
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Disputed Issue</h4>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{d.issue}</p>
                        {d.evidence && (
                          <div style={{ marginTop: 10, fontSize: 12, color: "var(--accent-purple)", display: "flex", alignItems: "center", gap: 5 }}>
                            <FileText size={12} />
                            <strong>Evidence Hash / Link:</strong> <a href={d.evidence} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>{d.evidence}</a>
                          </div>
                        )}
                      </div>

                      {/* AI resolution panel if resolved or can arbitrate */}
                      {d.aiResolution && d.aiResolution.suggestion ? (
                        <div style={{
                          background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.05))",
                          border: "1px solid rgba(99,102,241,0.25)",
                          borderRadius: 14, padding: 20, marginBottom: 24
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                              <Bot size={16} style={{ color: "#818cf8" }} /> AI Arbitration Report
                            </span>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                              CONFIDENCE: {d.aiResolution.confidenceScore}%
                            </span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#a5b4fc", marginBottom: 8 }}>
                            {d.aiResolution.suggestion}
                          </div>
                          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.6 }}>
                            <strong>Rationale:</strong> {d.aiResolution.rationale}
                          </p>

                          {/* Split visualizer bar */}
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                              <span>Client: {d.aiResolution.splitPercentageClient}%</span>
                              <span>Freelancer: {d.aiResolution.splitPercentageFreelancer}%</span>
                            </div>
                            <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, display: "flex", overflow: "hidden" }}>
                              <div style={{ width: `${d.aiResolution.splitPercentageClient}%`, background: "var(--accent-blue)" }} />
                              <div style={{ width: `${d.aiResolution.splitPercentageFreelancer}%`, background: "#34d399" }} />
                            </div>
                          </div>

                          {/* Audit scroll logs */}
                          {d.auditLog && d.auditLog.length > 0 && (
                            <div>
                              <h5 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                                <Activity size={12} /> Audit Trial Log
                              </h5>
                              <div style={{
                                maxHeight: 120, overflowY: "auto", background: "rgba(0,0,0,0.2)",
                                borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.05)",
                                fontSize: 11, color: "var(--text-secondary)", fontFamily: "monospace", display: "flex", flexDirection: "column", gap: 6
                              }}>
                                {d.auditLog.map((step, idx) => (
                                  <div key={idx} style={{ borderLeft: "2px solid #818cf8", paddingLeft: 8 }}>
                                    {step}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                          borderRadius: 14, padding: "20px 24px", marginBottom: 24, textAlign: "center"
                        }}>
                          <Bot size={32} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>AI Arbitration Available</div>
                          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>
                            Trigger our automated cognitive service to review details and issue a split suggestion.
                          </p>
                          <button
                            id="btn-trigger-ai-arbitration"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenArbitrator(d)}
                          >
                            ✦ Run AI Arbitrator
                          </button>
                        </div>
                      )}

                      {/* Chat Messages */}
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        <MessageSquare size={14}/> Dispute Conversation Thread
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                        {d.messages.map((m, i) => (
                          <div key={i} style={{
                            background: m.sender === "System" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.15)",
                            border: `1px solid ${
                              m.sender === "System" ? "rgba(255,255,255,0.05)"
                              : m.sender.toLowerCase().includes("client") ? "rgba(59,130,246,0.15)"
                              : "rgba(16,185,129,0.15)"
                            }`,
                            borderRadius: 10, padding: "12px 16px"
                          }}>
                            <div className="flex-between" style={{ marginBottom: 6 }}>
                              <span style={{
                                fontSize: 12, fontWeight: 700,
                                color: m.sender === "System" ? "var(--text-muted)"
                                     : m.sender.toLowerCase().includes("client") ? "var(--accent-blue)"
                                     : "var(--accent-green)"
                              }}>{m.sender.slice(0, 8)}...</span>
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{m.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                        <input
                          className="form-input"
                          placeholder="Submit your statement or evidence link..."
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button className="btn btn-secondary" onClick={() => handleSendMessage(d.disputeId)}>
                          <Send size={14}/> Send
                        </button>
                      </div>

                      {/* Admin Override Action */}
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: "var(--accent-amber)" }}
                          onClick={() => {
                            setShowOverride(!showOverride);
                            setOverrideData({
                              freelancerSplit: d.aiResolution ? d.aiResolution.splitPercentageFreelancer : 50,
                              clientSplit: d.aiResolution ? d.aiResolution.splitPercentageClient : 50,
                              comments: ""
                            });
                          }}
                        >
                          <Scale size={13} style={{ marginRight: 4 }} /> Admin Fallback Override
                        </button>
                      </div>

                      {showOverride && (
                        <div className="card" style={{ marginTop: 14, border: "1px solid rgba(245,158,11,0.25)" }}>
                          <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-amber)", marginBottom: 12 }}>Manual Arbitration Settings</h4>
                          
                          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                            <div style={{ flex: 1 }}>
                              <label className="form-label">Client Refund %</label>
                              <input
                                type="number"
                                className="form-input"
                                value={overrideData.clientSplit}
                                onChange={e => setOverrideData({
                                  ...overrideData,
                                  clientSplit: parseInt(e.target.value),
                                  freelancerSplit: 100 - parseInt(e.target.value)
                                })}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label className="form-label">Freelancer Payout %</label>
                              <input
                                type="number"
                                className="form-input"
                                value={overrideData.freelancerSplit}
                                onChange={e => setOverrideData({
                                  ...overrideData,
                                  freelancerSplit: parseInt(e.target.value),
                                  clientSplit: 100 - parseInt(e.target.value)
                                })}
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="form-label">Resolution Summary Comments</label>
                            <textarea
                              className="form-textarea"
                              placeholder="Reason for manual adjustment..."
                              value={overrideData.comments}
                              onChange={e => setOverrideData({ ...overrideData, comments: e.target.value })}
                            />
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowOverride(false)}>Cancel</button>
                            <button className="btn btn-warning btn-sm" onClick={() => handleManualOverride(d.disputeId)}>Confirm Override</button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Raise Dispute Form */}
          {showForm && (
            <div className="card animate-fadeInUp" id="dispute-form">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                <AlertTriangle size={18} style={{ display: "inline", marginRight: 8, color: "var(--accent-red)", verticalAlign: "middle" }} />
                Raise a New Dispute
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
                Freezes escrow release in Solana smart contract. Please submit evidence (IPFS links preferred).
              </p>

              <div className="form-group">
                <label className="form-label">Solana Project ID *</label>
                <input
                  className="form-input"
                  placeholder="e.g. P-101"
                  value={form.projectId}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Milestone Index *</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.milestoneIndex}
                  onChange={e => setForm({ ...form, milestoneIndex: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Describe the Issue *</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 120 }}
                  placeholder="Details of disagreement..."
                  value={form.issue}
                  onChange={e => setForm({ ...form, issue: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Evidence Link / IPFS Hash</label>
                <input
                  className="form-input"
                  placeholder="e.g. https://ipfs.io/ipfs/Qm..."
                  value={form.evidence}
                  onChange={e => setForm({ ...form, evidence: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleCreateDispute} disabled={loading}>
                  {loading ? "Submitting..." : "Submit On-chain Dispute"}
                </button>
              </div>
            </div>
          )}

          {/* Success message */}
          {submitted && (
            <div className="card animate-fadeInUp" style={{ textAlign: "center", padding: 48 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(245,158,11,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px"
              }}>
                <FileText size={30} style={{ color: "var(--accent-amber)" }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-amber)", marginBottom: 8 }}>
                Dispute Lodged On-chain
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 28px" }}>
                The milestone escrow is now frozen. Your dispute is locked in our AI arbitration queue.
              </p>
              <button className="btn btn-ghost" onClick={() => setSubmitted(false)}>
                Go to Dispute Thread
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
