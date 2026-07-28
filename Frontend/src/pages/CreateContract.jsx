import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Lock, Info, Plus, X, Wallet } from "lucide-react";

const MILESTONES_DEFAULT = [{ title:"Milestone 1", amount:"", deadline:"" }];

export default function CreateContract() {
  const navigate = useNavigate();
  const [step, setStep]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm]   = useState({
    freelancer: "",
    amount: "",
    currency: "USDC",
    title: "",
    description: "",
    deadline: "",
    category: "",
  });
  const [milestones, setMilestones] = useState(MILESTONES_DEFAULT);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const addMilestone = () =>
    setMilestones(prev => [...prev, { title:`Milestone ${prev.length+1}`, amount:"", deadline:"" }]);

  const removeMilestone = (i) =>
    setMilestones(prev => prev.filter((_, idx) => idx !== i));

  const handleCreate = () => {
    if (!form.freelancer || !form.amount || !form.title) {
      showToast("Please fill in all required fields.", "error"); return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Escrow contract deployed on-chain! 🎉");
      setTimeout(() => navigate("/contracts"), 1500);
    }, 2000);
  };

  const stepLabels = ["Contract Details", "Milestones", "Review & Deploy"];

  return (
    <div className="app-layout">
      <Sidebar walletAddress="0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12" />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Create Escrow Contract</span>
            <span className="topbar-breadcrumb">Dashboard / Create Contract</span>
          </div>
        </div>

        <div className="page-container" style={{ maxWidth:800 }}>
          {/* Step Indicator */}
          <div className="steps mb-8">
            {stepLabels.map((label, i) => (
              <>
                <div key={label} className={`step ${step > i+1 ? "done" : step === i+1 ? "active" : ""}`}>
                  <div className="step-num">{step > i+1 ? "✓" : i+1}</div>
                  <span className="step-label">{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`step-line ${step > i+1 ? "done" : ""}`} key={`line-${i}`} />
                )}
              </>
            ))}
          </div>

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="card animate-fadeInUp">
              <h2 style={{ fontSize:20, fontWeight:700, marginBottom:24 }}>Contract Details</h2>

              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input id="input-title" className="form-input" placeholder="e.g. Website Redesign"
                  value={form.title} onChange={e => set("title", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select id="input-category" className="form-select"
                  value={form.category} onChange={e => set("category", e.target.value)}>
                  <option value="">Select category</option>
                  {["Web Development","UI/UX Design","Smart Contract Dev","Content Writing",
                    "SEO / Marketing","Data Science","Mobile Dev","Other"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Freelancer Wallet Address *</label>
                <div className="input-group">
                  <Wallet className="input-icon" size={15} />
                  <input id="input-freelancer" className="form-input input-with-icon"
                    placeholder="0x..."
                    value={form.freelancer}
                    onChange={e => set("freelancer", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Total Amount *</label>
                  <div className="input-group">
                    <input id="input-amount" className="form-input"
                      type="number" min="0" placeholder="0.00"
                      value={form.amount}
                      onChange={e => set("amount", e.target.value)}
                      style={{ paddingRight:60 }}
                    />
                    <span className="input-suffix">{form.currency}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select id="input-currency" className="form-select"
                    value={form.currency} onChange={e => set("currency", e.target.value)}>
                    <option>USDC</option>
                    <option>USDT</option>
                    <option>ETH</option>
                    <option>DAI</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Project Deadline</label>
                <input id="input-deadline" className="form-input" type="date"
                  value={form.deadline} onChange={e => set("deadline", e.target.value)}
                  style={{ colorScheme:"dark" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Description</label>
                <textarea id="input-desc" className="form-textarea"
                  placeholder="Describe the project scope, deliverables, and expectations..."
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                />
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
                <button id="btn-step1-next" className="btn btn-primary" onClick={() => setStep(2)}>
                  Next: Milestones →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Milestones ── */}
          {step === 2 && (
            <div className="card animate-fadeInUp">
              <div className="flex-between mb-6">
                <h2 style={{ fontSize:20, fontWeight:700 }}>Payment Milestones</h2>
                <button id="btn-add-milestone" className="btn btn-secondary btn-sm" onClick={addMilestone}>
                  <Plus size={14}/> Add Milestone
                </button>
              </div>

              {milestones.map((m, i) => (
                <div key={i} style={{
                  background:"rgba(255,255,255,0.02)", border:"1px solid var(--border)",
                  borderRadius:12, padding:20, marginBottom:14, position:"relative"
                }}>
                  {milestones.length > 1 && (
                    <button
                      id={`btn-remove-milestone-${i}`}
                      onClick={() => removeMilestone(i)}
                      style={{
                        position:"absolute", top:14, right:14,
                        background:"none", border:"none", cursor:"pointer",
                        color:"var(--text-muted)"
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div style={{ fontWeight:600, fontSize:13, color:"var(--accent-purple)", marginBottom:14 }}>
                    Milestone {i+1}
                  </div>
                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">Title</label>
                      <input className="form-input" placeholder="e.g. Design Mockup"
                        value={m.title}
                        onChange={e => setMilestones(prev =>
                          prev.map((x,j) => j===i ? {...x,title:e.target.value} : x)
                        )}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">Amount ({form.currency})</label>
                      <input className="form-input" type="number" placeholder="0.00"
                        value={m.amount}
                        onChange={e => setMilestones(prev =>
                          prev.map((x,j) => j===i ? {...x,amount:e.target.value} : x)
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div style={{
                background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.15)",
                borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:8,
                fontSize:13, color:"var(--text-secondary)", marginBottom:24
              }}>
                <Info size={15} style={{ color:"var(--accent-purple)", flexShrink:0 }} />
                Funds are locked in escrow per milestone. Released only after your approval.
              </div>

              <div className="flex-between">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button id="btn-step2-next" className="btn btn-primary" onClick={() => setStep(3)}>
                  Review Contract →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="card animate-fadeInUp">
              <h2 style={{ fontSize:20, fontWeight:700, marginBottom:24 }}>Review & Deploy</h2>

              <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid var(--border)", borderRadius:12, padding:24, marginBottom:24 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  {[
                    { l:"Project", v: form.title || "—" },
                    { l:"Category", v: form.category || "—" },
                    { l:"Freelancer", v: form.freelancer || "—", mono:true },
                    { l:"Amount", v: `${form.amount || "0"} ${form.currency}`, bold:true },
                    { l:"Deadline", v: form.deadline || "—" },
                    { l:"Milestones", v: milestones.length },
                  ].map(({l,v,mono,bold}) => (
                    <div key={l}>
                      <div style={{ fontSize:11, color:"var(--text-muted)", letterSpacing:1, fontWeight:600, marginBottom:4 }}>{l.toUpperCase()}</div>
                      <div style={{
                        fontSize:14, color:"var(--text-primary)",
                        fontFamily: mono ? "'Courier New',monospace" : "inherit",
                        fontWeight: bold ? 700 : 500
                      }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="divider" style={{ margin:"20px 0" }} />

                {milestones.map((m,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color:"var(--text-secondary)" }}>{m.title}</span>
                    <span style={{ fontWeight:600, color:"var(--accent-green)" }}>{m.amount || "—"} {form.currency}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.15)",
                borderRadius:10, padding:"14px 18px", display:"flex", gap:10,
                fontSize:13, color:"var(--text-secondary)", marginBottom:28
              }}>
                <Lock size={16} style={{ color:"var(--accent-green)", flexShrink:0, marginTop:1 }} />
                <span>Deploying this contract will lock <strong style={{ color:"var(--accent-green)" }}>{form.amount || "0"} {form.currency}</strong> in a tamper-proof Ethereum escrow smart contract.</span>
              </div>

              <div className="flex-between">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button
                  id="btn-deploy-contract"
                  className="btn btn-primary btn-lg"
                  onClick={handleCreate}
                  disabled={loading}
                  style={{ minWidth:200 }}
                >
                  {loading ? <><span className="spinner" /> Deploying…</> : <><Lock size={16}/> Lock & Deploy Contract</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </div>
  );
}
