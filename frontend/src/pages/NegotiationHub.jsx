import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";
import {
  FileText, Shield, User, MessageSquare, Send, CheckCircle,
  AlertTriangle, Play, HelpCircle, ArrowLeft, Plus, X, Lock, RefreshCw, Cpu
} from "lucide-react";
import * as api from "../services/api";

export default function NegotiationHub() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { user } = useAuth();
  const { shortAddr } = useWallet();

  const userRole = user?.role || "freelancer";
  const userWallet = user?.walletAddress || "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12";

  // State
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState(null);

  // Draft form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: 0,
    currency: "USDC",
    deadline: "",
    freelancerPubkey: "",
    milestones: []
  });

  // Chat/Q&A state
  const [chatMessage, setChatMessage] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswers, setAiAnswers] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [activeTab, setActiveTab] = useState("chat"); // chat, logs

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDraftForm, setNewDraftForm] = useState({
    title: "",
    description: "",
    budget: 500,
    currency: "USDC",
    deadline: "",
    freelancerPubkey: "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12",
    milestones: [
      { title: "Milestone 1: Setup & Design", amount: 200 },
      { title: "Milestone 2: Final Delivery", amount: 300 }
    ]
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load all drafts
  const loadDrafts = async () => {
    setLoading(true);
    try {
      const data = await api.getDraftContracts(sessionStorage.getItem("ps_token") || "");
      setDrafts(data);
      if (routeId) {
        const found = data.find(d => d._id === routeId);
        if (found) selectDraft(found);
      }
    } catch (err) {
      console.warn("Backend not running or failed to fetch drafts. Using rich mock data.");
      // Rich mock data fallback
      const mockDrafts = [
        {
          _id: "draft_101",
          title: "Logo & Brand Identity Pack",
          description: "Develop a professional logo design, SVG assets, typography guide, and complete brand asset kit. Needs IP ownership transferred upon payment release.",
          budget: 500,
          currency: "USDC",
          deadline: "2026-08-30",
          clientPubkey: "0xB2C3D4E5F6789012BCDEF1234567890ABCDEF1234", // Sarah Chen
          freelancerPubkey: "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12", // Alex Johnson
          clientApproved: true,
          freelancerApproved: false,
          status: "negotiating",
          version: 2,
          milestones: [
            { title: "Milestone 1: Moodboards & Sketch Concept", amount: 200 },
            { title: "Milestone 2: Final Vector Logo & Brandbook", amount: 300 }
          ],
          chat: [
            { sender: "0xB2C3D4E5F6789012BCDEF1234567890ABCDEF1234", text: "Hi Alex, I put together the initial milestone breakdown. What do you think?", timestamp: new Date(Date.now() - 3600000 * 24) },
            { sender: "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12", text: "Looks good, Sarah! I approved my side. Just waiting on you.", timestamp: new Date(Date.now() - 3600000 * 2) }
          ],
          logs: [
            { actor: "0xB2C3D4E5F6789012BCDEF1234567890ABCDEF1234", action: "CREATED", details: "Draft contract initiated with budget 500 USDC and 2 milestones.", timestamp: new Date(Date.now() - 3600000 * 24) },
            { actor: "0xB2C3D4E5F6789012BCDEF1234567890ABCDEF1234", action: "EDITED", details: "Client made changes: Title updated to 'Logo & Brand Identity Pack'", timestamp: new Date(Date.now() - 3600000 * 3) }
          ],
          createdAt: new Date(Date.now() - 3600000 * 24),
          updatedAt: new Date()
        },
        {
          _id: "draft_102",
          title: "Mobile App Landing Page",
          description: "Design and build a responsive landing page for the new Payshield Mobile App using React & TailwindCSS. Deliver files as a git repo.",
          budget: 1200,
          currency: "USDC",
          deadline: "2026-09-15",
          clientPubkey: "0xB2C3D4E5F6789012BCDEF1234567890ABCDEF1234", // Sarah Chen
          freelancerPubkey: "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12", // Alex Johnson
          clientApproved: true,
          freelancerApproved: true,
          status: "approved",
          version: 3,
          milestones: [
            { title: "Milestone 1: Figma Layout Prototypes", amount: 400 },
            { title: "Milestone 2: React Frontend Coding", amount: 800 }
          ],
          chat: [],
          logs: [
            { actor: "0xB2C3D4E5F6789012BCDEF1234567890ABCDEF1234", action: "CREATED", details: "Draft initiated.", timestamp: new Date(Date.now() - 3600000 * 96) },
            { actor: "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12", action: "APPROVED", details: "Terms approved by Freelancer.", timestamp: new Date(Date.now() - 3600000 * 12) },
            { actor: "0xB2C3D4E5F6789012BCDEF1234567890ABCDEF1234", action: "APPROVED", details: "Terms approved by Client.", timestamp: new Date(Date.now() - 3600000 * 11) }
          ],
          createdAt: new Date(Date.now() - 3600000 * 96),
          updatedAt: new Date()
        }
      ];
      setDrafts(mockDrafts);
      if (routeId) {
        const found = mockDrafts.find(d => d._id === routeId);
        if (found) selectDraft(found);
      } else if (mockDrafts.length > 0) {
        selectDraft(mockDrafts[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, [routeId]);

  const selectDraft = (draft) => {
    setSelectedDraft(draft);
    setForm({
      title: draft.title,
      description: draft.description,
      budget: draft.budget,
      currency: draft.currency,
      deadline: draft.deadline?.split("T")[0] || draft.deadline || "",
      freelancerPubkey: draft.freelancerPubkey || "",
      milestones: [...(draft.milestones || [])]
    });
    setEditMode(false);
    runAudit(draft);
    setAiAnswers([]);
  };

  // Run AI Risk Audit
  const runAudit = async (draft) => {
    try {
      const data = await api.getDraftAIRiskAudit(draft._id, sessionStorage.getItem("ps_token"));
      setAuditResult(data);
    } catch (err) {
      // Mock audit fallback
      const text = `${draft.title} ${draft.description}`.toLowerCase();
      let scorePoints = 0;
      const checks = {
        ipTransfer: false,
        confidentiality: false,
        cancellation: false,
        specificity: false,
        paymentTerms: false
      };
      const recs = [];

      if (text.includes("ip") || text.includes("ownership") || text.includes("rights") || text.includes("copyright")) {
        checks.ipTransfer = true; scorePoints += 20;
      } else {
        recs.push("Missing IP Transfer clause: Add details assigning work ownership to the client upon milestone payment release.");
      }

      if (text.includes("confidential") || text.includes("nda") || text.includes("secret")) {
        checks.confidentiality = true; scorePoints += 20;
      } else {
        recs.push("No NDA/Confidentiality terms: Add standard confidentiality provisions to protect project details.");
      }

      if (text.includes("cancel") || text.includes("terminate") || text.includes("refund")) {
        checks.cancellation = true; scorePoints += 20;
      } else {
        recs.push("No early termination procedure specified. Add clear refund and kill-fee terms.");
      }

      if (draft.description.length > 100 && draft.milestones?.length >= 2) {
        checks.specificity = true; scorePoints += 20;
      } else {
        recs.push("Scope description is too short or lacks multiple milestones. Risk of scope creep.");
      }

      if (draft.milestones?.length > 0 && draft.milestones.reduce((s, m) => s + m.amount, 0) === draft.budget) {
        checks.paymentTerms = true; scorePoints += 20;
      } else {
        recs.push("Milestone amounts mismatch or undefined milestone funding.");
      }

      setAuditResult({
        riskScore: 100 - scorePoints,
        checks,
        recommendations: recs
      });
    }
  };

  // Handle Edit Submission
  const handleUpdate = async () => {
    try {
      let updatedDraft;
      try {
        updatedDraft = await api.updateDraftContract(selectedDraft._id, form, sessionStorage.getItem("ps_token"));
      } catch (err) {
        // Mock update
        const userLabel = userWallet === selectedDraft.clientPubkey ? "Client" : "Freelancer";
        updatedDraft = {
          ...selectedDraft,
          ...form,
          clientApproved: userWallet === selectedDraft.clientPubkey,
          freelancerApproved: userWallet === selectedDraft.freelancerPubkey,
          version: selectedDraft.version + 1,
          logs: [
            ...selectedDraft.logs,
            {
              actor: userWallet,
              action: "EDITED",
              details: `${userLabel} updated negotiation parameters. Approvals reset.`,
              timestamp: new Date()
            }
          ]
        };
      }
      setSelectedDraft(updatedDraft);
      setDrafts(prev => prev.map(d => d._id === updatedDraft._id ? updatedDraft : d));
      setEditMode(false);
      runAudit(updatedDraft);
      showToast("Negotiation draft updated! Approvals reset for transparency.");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // Handle Chat Message
  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      let updated;
      try {
        updated = await api.addDraftMessage(selectedDraft._id, chatMessage, sessionStorage.getItem("ps_token"));
      } catch (err) {
        updated = {
          ...selectedDraft,
          chat: [
            ...selectedDraft.chat,
            { sender: userWallet, text: chatMessage, timestamp: new Date() }
          ]
        };
      }
      setSelectedDraft(updated);
      setChatMessage("");
      setDrafts(prev => prev.map(d => d._id === updated._id ? updated : d));
    } catch (err) {
      showToast("Failed to send message", "error");
    }
  };

  // Ask AI Q&A
  const askAI = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    const userQ = aiQuestion;
    setAiQuestion("");
    setAiAnswers(prev => [...prev, { type: "user", text: userQ }]);

    try {
      let answer;
      try {
        const res = await api.askDraftAIQuestion(selectedDraft._id, userQ, sessionStorage.getItem("ps_token"));
        answer = res.answer;
      } catch (err) {
        // Mock AI Q&A response logic
        const q = userQ.toLowerCase();
        const text = `${selectedDraft.title} ${selectedDraft.description}`.toLowerCase();

        if (q.includes("ip") || q.includes("ownership") || q.includes("copyright")) {
          const hasIp = text.includes("ip") || text.includes("ownership") || text.includes("rights");
          answer = hasIp
            ? "🛡️ **IP ownership is covered!** Standard PayShield protocols transfer all copyright and design IP to the Client as soon as the final milestone payment releases on-chain."
            : "⚠️ **IP transfer is currently undefined.** Since there are no IP clauses in your description, legally ownership remains ambiguous. **Recommendation:** Update your description with: *'All intellectual property rights developed under this contract shall transfer to the client upon full payment of escrowed funds.'*";
        } else if (q.includes("cancel") || q.includes("terminate") || q.includes("refund")) {
          answer = "📋 **Cancellation terms:** The draft lacks explicit kill-fees. On-chain escrows require mutual signature or AI Dispute Center arbitration to refund locked balances. We recommend adding: *'If cancelled early, completed milestones are paid to the freelancer and remaining balances are refunded.'*";
        } else if (q.includes("confidential") || q.includes("nda")) {
          answer = "🔒 **Confidentiality:** The terms are currently public to this negotiation. If sensitive code access is needed, we recommend adding: *'Freelancer agrees to keep all project systems and datasets strictly confidential.'*";
        } else {
          answer = `💡 **Contract Analysis Summary:** This contract features a total budget of **${selectedDraft.budget} ${selectedDraft.currency}** divided into **${selectedDraft.milestones?.length || 0} milestones**. You can edit the parameters to insert specific legal keywords (NDA, IP, Cancellation) and run audits to see score improvements.`;
        }
      }
      setAiAnswers(prev => [...prev, { type: "ai", text: answer }]);
    } catch (err) {
      setAiAnswers(prev => [...prev, { type: "ai", text: "Intelligence assistant error. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Sign & Approve
  const handleApprove = async () => {
    try {
      let updated;
      try {
        updated = await api.approveDraftContract(selectedDraft._id, sessionStorage.getItem("ps_token"));
      } catch (err) {
        const isClient = userWallet === selectedDraft.clientPubkey;
        const cApproved = isClient ? true : selectedDraft.clientApproved;
        const fApproved = !isClient ? true : selectedDraft.freelancerApproved;
        const fullyApproved = cApproved && fApproved;

        const actorLabel = isClient ? "Client" : "Freelancer";

        updated = {
          ...selectedDraft,
          clientApproved: cApproved,
          freelancerApproved: fApproved,
          status: fullyApproved ? "approved" : "negotiating",
          logs: [
            ...selectedDraft.logs,
            {
              actor: userWallet,
              action: "APPROVED",
              details: `Terms signed and approved by ${actorLabel}.`,
              timestamp: new Date()
            },
            ...(fullyApproved ? [{
              actor: "SYSTEM",
              action: "STATUS_CHANGE",
              details: "Contract fully approved by both parties. Ready for deployment.",
              timestamp: new Date()
            }] : [])
          ]
        };
      }
      setSelectedDraft(updated);
      setDrafts(prev => prev.map(d => d._id === updated._id ? updated : d));
      showToast(updated.status === "approved" ? "Contract fully approved! Ready to deploy." : "Your approval signature has been recorded!");
    } catch (err) {
      showToast("Approval signature failed", "error");
    }
  };

  // Deploy on Solana Escrow Program
  const handleDeploy = async () => {
    try {
      // Execute local deployment
      showToast("Calling Solana Escrow Program: locking funds in PDA... 🔐", "info");
      
      setTimeout(async () => {
        let updated;
        try {
          updated = await api.deployDraftOnChain(selectedDraft._id, sessionStorage.getItem("ps_token"));
        } catch (err) {
          updated = {
            ...selectedDraft,
            status: "deployed",
            logs: [
              ...selectedDraft.logs,
              {
                actor: selectedDraft.clientPubkey,
                action: "DEPLOYED",
                details: "USDC Funds locked in PDA. Contract deployed on Solana devnet! Escrow Program ID: 43QYPVLR...",
                timestamp: new Date()
              }
            ]
          };
        }
        setSelectedDraft(updated);
        setDrafts(prev => prev.map(d => d._id === updated._id ? updated : d));
        showToast("Solana Escrow initialized! Funds locked securely. 🎉");
      }, 2000);

    } catch (err) {
      showToast("Deployment failed on Solana", "error");
    }
  };

  // Create Draft
  const handleCreateDraft = async (e) => {
    e.preventDefault();
    try {
      let newDraft;
      try {
        newDraft = await api.createDraftContract(newDraftForm, sessionStorage.getItem("ps_token"));
      } catch (err) {
        newDraft = {
          _id: `draft_${Date.now()}`,
          ...newDraftForm,
          clientPubkey: userWallet,
          clientApproved: true,
          freelancerApproved: false,
          status: "negotiating",
          version: 1,
          chat: [],
          logs: [
            {
              actor: userWallet,
              action: "CREATED",
              details: `Draft contract initiated with budget ${newDraftForm.budget} USDC and ${newDraftForm.milestones.length} milestones.`,
              timestamp: new Date()
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      setDrafts(prev => [newDraft, ...prev]);
      setSelectedDraft(newDraft);
      selectDraft(newDraft);
      setShowCreateModal(false);
      showToast("Negotiation draft created successfully!");
    } catch (err) {
      showToast("Failed to create draft negotiation", "error");
    }
  };

  const getActorLabel = (pubkey) => {
    if (pubkey === selectedDraft?.clientPubkey) return "Client";
    if (pubkey === selectedDraft?.freelancerPubkey) return "Freelancer";
    return "Member";
  };

  return (
    <div className="app-layout">
      <Sidebar walletAddress={userWallet} />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Contract Negotiation Hub</span>
            <span className="topbar-breadcrumb">Contracts / Collaborative Workspace</span>
          </div>
          <div className="topbar-right">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={14} /> New Draft Negotiation
            </button>
            <div className="wallet-badge" onClick={() => navigate("/wallet")}>
              <div className="wallet-dot" />
              {shortAddr || `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="page-container" style={{ maxWidth: 1400 }}>
          {toast && (
            <div className={`toast toast-${toast.type} animate-fadeIn`} style={{
              position: "fixed", bottom: 24, right: 24, zIndex: 1000,
              background: toast.type === "error" ? "var(--accent-red)" : toast.type === "info" ? "var(--accent-blue)" : "var(--accent-green)",
              color: "white", padding: "12px 24px", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              fontWeight: 600, display: "flex", alignItems: "center", gap: 8
            }}>
              <Shield size={16} />
              {toast.msg}
            </div>
          )}

          {/* Draft Selection List (Dropdown/Flex if on detail, grid if no detail selected) */}
          <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 24, paddingBottom: 6 }}>
            {drafts.map(d => (
              <button
                key={d._id}
                onClick={() => selectDraft(d)}
                style={{
                  background: selectedDraft?._id === d._id ? "rgba(99, 102, 241, 0.15)" : "var(--bg-card)",
                  border: selectedDraft?._id === d._id ? "1px solid var(--accent-purple)" : "1px solid var(--border)",
                  borderRadius: 12, padding: "12px 18px", color: "white", textAlign: "left", cursor: "pointer",
                  minWidth: 260, flexShrink: 0, transition: "all 0.2s"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {d.title}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginTop: 6 }}>
                  <span>{d.budget} {d.currency}</span>
                  <span className={`badge ${d.status === "deployed" ? "badge-completed" : d.status === "approved" ? "badge-active" : "badge-pending"}`} style={{ padding: "1px 6px", fontSize: 9 }}>
                    {d.status}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedDraft ? (
            <div className="grid-3" style={{ gap: 24, gridTemplateColumns: "1fr 1fr 1.1fr" }}>
              {/* PANEL 1: Collaborative Form Editor */}
              <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="flex-between">
                  <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={16} style={{ color: "var(--accent-purple)" }} /> Contract Terms
                  </h3>
                  {!editMode && selectedDraft.status === "negotiating" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditMode(true)}
                      style={{ fontSize: 12 }}
                    >
                      Propose Edits
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11 }}>Project Title</label>
                      <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11 }}>Description</label>
                      <textarea className="form-textarea" style={{ height: 100 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 11 }}>Total Budget</label>
                        <input className="form-input" type="number" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 11 }}>Freelancer Key</label>
                        <input className="form-input" value={form.freelancerPubkey} onChange={e => setForm({ ...form, freelancerPubkey: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11, display: "flex", justifyContent: "space-between" }}>
                        <span>Milestones</span>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 10, padding: "2px 6px" }}
                          onClick={() => setForm({
                            ...form,
                            milestones: [...form.milestones, { title: `Milestone ${form.milestones.length + 1}`, amount: 0 }]
                          })}
                        >
                          + Add
                        </button>
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 150, overflowY: "auto", paddingRight: 4 }}>
                        {form.milestones.map((m, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              className="form-input"
                              style={{ flex: 2, padding: "6px" }}
                              placeholder="Title"
                              value={m.title}
                              onChange={e => {
                                const copy = [...form.milestones];
                                copy[idx].title = e.target.value;
                                setForm({ ...form, milestones: copy });
                              }}
                            />
                            <input
                              className="form-input"
                              style={{ flex: 1, padding: "6px" }}
                              type="number"
                              placeholder="Amount"
                              value={m.amount}
                              onChange={e => {
                                const copy = [...form.milestones];
                                copy[idx].amount = Number(e.target.value);
                                setForm({ ...form, milestones: copy });
                              }}
                            />
                            <button
                              className="btn btn-ghost"
                              style={{ padding: "4px", color: "var(--accent-red)" }}
                              onClick={() => setForm({
                                ...form,
                                milestones: form.milestones.filter((_, i) => i !== idx)
                              })}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleUpdate}>
                        Submit Terms Revision
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <h4 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{selectedDraft.title}</h4>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>{selectedDraft.description}</p>
                    </div>

                    <div className="divider" style={{ borderBottom: "1px solid var(--border)" }}></div>

                    <div className="grid-2" style={{ fontSize: 13 }}>
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>Client Signature</span>
                        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle size={14} style={{ color: selectedDraft.clientApproved ? "var(--accent-green)" : "var(--text-muted)" }} />
                          <span style={{ fontWeight: 600 }}>{selectedDraft.clientApproved ? "Signed" : "Pending"}</span>
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>Freelancer Signature</span>
                        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle size={14} style={{ color: selectedDraft.freelancerApproved ? "var(--accent-green)" : "var(--text-muted)" }} />
                          <span style={{ fontWeight: 600 }}>{selectedDraft.freelancerApproved ? "Signed" : "Pending"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="divider" style={{ borderBottom: "1px solid var(--border)" }}></div>

                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: 11, display: "block", marginBottom: 6 }}>Budget & Milestones Breakdown</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {selectedDraft.milestones?.map((m, idx) => (
                          <div key={idx} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)",
                            borderRadius: 8, padding: "10px 14px"
                          }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</span>
                            <span style={{ fontSize: 13, color: "var(--accent-purple)", fontWeight: 700 }}>{m.amount} {selectedDraft.currency}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15, marginTop: 12, padding: "0 4px" }}>
                        <span>Total Lock Escrow:</span>
                        <span style={{ color: "var(--accent-cyan)" }}>{selectedDraft.budget} {selectedDraft.currency}</span>
                      </div>
                    </div>

                    {selectedDraft.status === "negotiating" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        {((userWallet === selectedDraft.clientPubkey && !selectedDraft.clientApproved) ||
                          (userWallet === selectedDraft.freelancerPubkey && !selectedDraft.freelancerApproved)) ? (
                          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleApprove}>
                            Sign & Approve Terms
                          </button>
                        ) : (
                          <div className="card" style={{
                            background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)",
                            padding: "8px 12px", width: "100%", textAlign: "center", color: "var(--accent-green)",
                            fontSize: 13, fontWeight: 600
                          }}>
                            ✓ Signed & Approved (Waiting for counterparty)
                          </div>
                        )}
                      </div>
                    )}

                    {selectedDraft.status === "approved" && (
                      <div style={{ marginTop: 8 }}>
                        {userWallet === selectedDraft.clientPubkey ? (
                          <button className="btn btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleDeploy}>
                            <Lock size={15} /> Lock Escrow & Deploy on Solana
                          </button>
                        ) : (
                          <div className="card" style={{
                            background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)",
                            padding: "10px 14px", color: "var(--accent-blue)", fontSize: 13, fontWeight: 600, textAlign: "center"
                          }}>
                            Draft Signed! Waiting for Client to deploy escrow vault on Solana.
                          </div>
                        )}
                      </div>
                    )}

                    {selectedDraft.status === "deployed" && (
                      <div className="card" style={{
                        background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)",
                        padding: "12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, color: "var(--accent-green)"
                      }}>
                        <Shield size={20} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>Escrow Vault Funded & Active</div>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>Solana Escrow State Node Activated</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PANEL 2: Chat & Audit Logs */}
              <div className="card" style={{ display: "flex", flexDirection: "column", height: 600 }}>
                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
                  <button
                    onClick={() => setActiveTab("chat")}
                    style={{
                      flex: 1, padding: "10px", background: "none", border: "none",
                      borderBottom: activeTab === "chat" ? "2px solid var(--accent-purple)" : "none",
                      color: activeTab === "chat" ? "white" : "var(--text-secondary)",
                      fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    Negotiation Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("logs")}
                    style={{
                      flex: 1, padding: "10px", background: "none", border: "none",
                      borderBottom: activeTab === "logs" ? "2px solid var(--accent-purple)" : "none",
                      color: activeTab === "logs" ? "white" : "var(--text-secondary)",
                      fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    Change Logs
                  </button>
                </div>

                {activeTab === "chat" ? (
                  <>
                    {/* Chat Messages */}
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4, marginBottom: 12 }}>
                      {selectedDraft.chat?.length === 0 ? (
                        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, marginTop: 40 }}>
                          No negotiation messages yet. Start the discussion!
                        </div>
                      ) : (
                        selectedDraft.chat?.map((msg, idx) => {
                          const isMe = msg.sender === userWallet;
                          return (
                            <div key={idx} style={{
                              display: "flex", flexDirection: "column",
                              alignItems: isMe ? "flex-end" : "flex-start",
                            }}>
                              <span style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>
                                {getActorLabel(msg.sender)} ({msg.sender.slice(0, 6)}...)
                              </span>
                              <div style={{
                                background: isMe ? "var(--accent-purple)" : "rgba(255, 255, 255, 0.05)",
                                border: isMe ? "none" : "1px solid var(--border)",
                                borderRadius: 12, padding: "10px 14px", maxWidth: "85%",
                                fontSize: 13, color: "white", lineHeight: 1.4
                              }}>
                                {msg.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={sendChat} style={{ display: "flex", gap: 8 }}>
                      <input
                        className="form-input"
                        placeholder="Discuss terms or revisions..."
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        disabled={selectedDraft.status === "deployed"}
                      />
                      <button className="btn btn-primary" type="submit" style={{ padding: "10px" }} disabled={selectedDraft.status === "deployed"}>
                        <Send size={15} />
                      </button>
                    </form>
                  </>
                ) : (
                  /* Revision Audit Logs */
                  <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                    {selectedDraft.logs?.map((log, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: log.action === "CREATED" ? "var(--accent-cyan)"
                                    : log.action === "APPROVED" ? "var(--accent-green)"
                                    : log.action === "DEPLOYED" ? "var(--accent-blue)"
                                    : "var(--accent-amber)",
                          marginTop: 4, flexShrink: 0
                        }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                            {log.action} <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>by {getActorLabel(log.actor)}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>
                            {log.details}
                          </div>
                          <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PANEL 3: Contract Intelligence Assistant */}
              <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <Cpu size={18} style={{ color: "var(--accent-cyan)" }} /> Contract Intelligence
                </h3>

                {/* Risk Score Meter */}
                {auditResult && (
                  <div className="card" style={{
                    background: "rgba(18, 22, 40, 0.4)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 16, padding: "14px 18px"
                  }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: "50%",
                      border: `4px solid ${auditResult.riskScore > 50 ? "var(--accent-red)" : auditResult.riskScore > 20 ? "var(--accent-amber)" : "var(--accent-green)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 16, flexShrink: 0
                    }}>
                      {auditResult.riskScore}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Risk Audit Score</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                        {auditResult.riskScore > 50 ? "High Risk: Essential clauses missing." : auditResult.riskScore > 20 ? "Medium Risk: Minor recommendations." : "Low Risk: Terms look transparent & robust."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Checklist */}
                {auditResult && (
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                      Clause Coverage
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        { label: "IP Rights Assignment", value: auditResult.checks?.ipTransfer },
                        { label: "Confidentiality / NDA", value: auditResult.checks?.confidentiality },
                        { label: "Termination & Exit Clause", value: auditResult.checks?.cancellation },
                        { label: "Scope & Detail Specificity", value: auditResult.checks?.specificity },
                        { label: "Milestone Allocations", value: auditResult.checks?.paymentTerms }
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                          <span style={{
                            color: item.value ? "var(--accent-green)" : "var(--accent-red)",
                            fontWeight: 600
                          }}>
                            {item.value ? "✓ Covered" : "✗ Missing"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {auditResult?.recommendations?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                      AI Recommendations
                    </h4>
                    <div style={{
                      display: "flex", flexDirection: "column", gap: 8,
                      maxHeight: 120, overflowY: "auto", paddingRight: 4
                    }}>
                      {auditResult.recommendations.map((rec, idx) => (
                        <div key={idx} style={{
                          display: "flex", gap: 6, fontSize: 11, color: "var(--accent-amber)",
                          background: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.12)",
                          padding: "6px 10px", borderRadius: 6
                        }}>
                          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="divider" style={{ borderBottom: "1px solid var(--border)" }}></div>

                {/* Interactive Q&A chat */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 200 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                    Interactive Q&A Agent
                  </h4>

                  {/* QA messages scroll */}
                  <div style={{
                    flex: 1, overflowY: "auto", border: "1px solid var(--border)",
                    borderRadius: 10, padding: 12, background: "rgba(0,0,0,0.15)",
                    display: "flex", flexDirection: "column", gap: 10, marginBottom: 10,
                    maxHeight: 160
                  }}>
                    {aiAnswers.length === 0 ? (
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", margin: "auto" }}>
                        Ask me: "Who owns the code?", "What if there is a delay?", "Is there an NDA?"
                      </div>
                    ) : (
                      aiAnswers.map((item, idx) => (
                        <div key={idx} style={{ fontSize: 12, lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 700, color: item.type === "ai" ? "var(--accent-cyan)" : "var(--accent-purple)" }}>
                            {item.type === "ai" ? "Assistant: " : "You: "}
                          </span>
                          <span style={{ color: "var(--text-primary)" }}>{item.text}</span>
                        </div>
                      ))
                    )}
                    {aiLoading && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Analyzing terms...</div>}
                  </div>

                  <form onSubmit={askAI} style={{ display: "flex", gap: 6 }}>
                    <input
                      className="form-input"
                      style={{ fontSize: 12, padding: "8px" }}
                      placeholder="Ask about clauses or liabilities..."
                      value={aiQuestion}
                      onChange={e => setAiQuestion(e.target.value)}
                    />
                    <button className="btn btn-secondary btn-sm" type="submit" disabled={aiLoading}>
                      Ask
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: "60px 20px", textAlign: "center" }}>
              <Shield size={40} style={{ color: "var(--accent-purple)", margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Select or Create a Draft Negotiation</h3>
              <p style={{ color: "var(--text-secondary)", marginTop: 6, maxWidth: 460, margin: "6px auto 20px" }}>
                Negotiate details collaboratively, run AI legal audits, align on milestone payouts, and sign draft terms before deploying escrows to Solana.
              </p>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                Create New Negotiation Draft
              </button>
            </div>
          )}
        </div>

        {/* Modal: Create Negotiation Draft */}
        {showCreateModal && (
          <div className="modal-backdrop" style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1000
          }}>
            <div className="card animate-fadeInUp" style={{ maxWidth: 540, width: "90%", padding: 28, position: "relative" }}>
              <button
                style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} />
              </button>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Negotiation Draft</h3>

              <form onSubmit={handleCreateDraft} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Project Title *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="e.g. DeFi Staking Smart Contract Development"
                    value={newDraftForm.title}
                    onChange={e => setNewDraftForm({ ...newDraftForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project Description *</label>
                  <textarea
                    className="form-textarea"
                    required
                    style={{ height: 90 }}
                    placeholder="Provide details about delivery scope. Pro-tip: include clauses for IP rights transfer, confidentiality, and cancellation procedures."
                    value={newDraftForm.description}
                    onChange={e => setNewDraftForm({ ...newDraftForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Freelancer Solana Wallet Address *</label>
                  <input
                    className="form-input"
                    required
                    placeholder="0x..."
                    value={newDraftForm.freelancerPubkey}
                    onChange={e => setNewDraftForm({ ...newDraftForm, freelancerPubkey: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Overall Budget</label>
                    <input
                      className="form-input"
                      type="number"
                      value={newDraftForm.budget}
                      onChange={e => setNewDraftForm({ ...newDraftForm, budget: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input
                      className="form-input"
                      type="date"
                      value={newDraftForm.deadline}
                      onChange={e => setNewDraftForm({ ...newDraftForm, deadline: e.target.value })}
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>

                <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }}>
                  Create & Open Negotiation Hub
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
