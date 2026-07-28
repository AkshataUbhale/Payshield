import { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { UploadCloud, File, CheckCircle, X, Link, Hash } from "lucide-react";

const CONTRACTS = [
  { id: 1, title:"Logo & Brand Identity", amount:200, status:"Active" },
  { id: 2, title:"Smart Contract Development", amount:800, status:"Active" },
  { id: 4, title:"Mobile App UI Design", amount:450, status:"Active" },
];

export default function SubmitWork() {
  const [selectedContract, setSelectedContract] = useState("");
  const [files, setFiles] = useState([]);
  const [note, setNote]   = useState("");
  const [drag, setDrag]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded]   = useState(null);
  const fileRef = useRef();

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList).map(f => ({
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + " KB",
      type: f.type
    }));
    setFiles(prev => [...prev, ...arr]);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, j) => j !== i));

  const handleUpload = () => {
    if (!selectedContract) { alert("Select a contract first."); return; }
    if (!files.length)     { alert("Please attach at least one file."); return; }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded({
        hash: "QmXz7rNkwPLp8kHBFtMbv3QJ5xRuY9WcNdTq2eMfA6yGz4",
        contract: CONTRACTS.find(c => c.id === parseInt(selectedContract))?.title,
        files: files.length,
        timestamp: new Date().toLocaleString()
      });
    }, 2500);
  };

  const getFileIcon = (type) => {
    if (type?.includes("image")) return "🖼️";
    if (type?.includes("pdf"))   return "📄";
    if (type?.includes("zip") || type?.includes("compressed")) return "🗜️";
    return "📁";
  };

  return (
    <div className="app-layout">
      <Sidebar walletAddress="0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12" />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Submit Work</span>
            <span className="topbar-breadcrumb">Dashboard / Submit Deliverable</span>
          </div>
        </div>

        <div className="page-container" style={{ maxWidth:760 }}>
          {uploaded ? (
            /* ── Success State ── */
            <div className="card animate-fadeInUp" style={{ textAlign:"center", padding:48 }}>
              <div style={{
                width:72, height:72, borderRadius:"50%",
                background:"rgba(16,185,129,0.15)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 20px"
              }}>
                <CheckCircle size={36} style={{ color:"var(--accent-green)" }} />
              </div>
              <h2 style={{ fontSize:22, fontWeight:800, color:"var(--accent-green)", marginBottom:8 }}>
                Work Submitted to IPFS!
              </h2>
              <p style={{ color:"var(--text-secondary)", marginBottom:32, lineHeight:1.7 }}>
                Your deliverables have been uploaded to the decentralized IPFS network.<br/>
                The client will be notified to review and approve payment.
              </p>

              <div style={{
                background:"rgba(0,0,0,0.2)", border:"1px solid var(--border)",
                borderRadius:14, padding:24, textAlign:"left", marginBottom:28
              }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  {[
                    { l:"Contract",   v: uploaded.contract },
                    { l:"Files",      v: `${uploaded.files} file(s)` },
                    { l:"Timestamp",  v: uploaded.timestamp },
                    { l:"Network",    v: "IPFS (Decentralized)" },
                  ].map(({l,v}) => (
                    <div key={l}>
                      <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:3 }}>{l.toUpperCase()}</div>
                      <div style={{ fontSize:13, color:"var(--text-secondary)" }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="divider" />

                <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginBottom:8 }}>
                  <Hash size={11} style={{ display:"inline", marginRight:4 }} />IPFS CONTENT HASH
                </div>
                <div className="hash-box">
                  <Link size={13} />
                  <span>{uploaded.hash}</span>
                </div>
              </div>

              <button
                id="btn-submit-another"
                className="btn btn-secondary"
                onClick={() => { setUploaded(null); setFiles([]); setNote(""); setSelectedContract(""); }}
              >
                Submit Another Deliverable
              </button>
            </div>
          ) : (
            /* ── Upload Form ── */
            <>
              {/* Contract selector */}
              <div className="card mb-6 animate-fadeInUp">
                <h2 style={{ fontSize:18, fontWeight:700, marginBottom:18 }}>Select Contract</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {CONTRACTS.map(c => (
                    <label
                      key={c.id}
                      htmlFor={`contract-radio-${c.id}`}
                      style={{
                        display:"flex", alignItems:"center", gap:14,
                        padding:"14px 18px",
                        background: selectedContract == c.id ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${selectedContract == c.id ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
                        borderRadius:10, cursor:"pointer", transition:"all 0.2s ease"
                      }}
                    >
                      <input
                        type="radio"
                        id={`contract-radio-${c.id}`}
                        name="contract"
                        value={c.id}
                        checked={selectedContract == c.id}
                        onChange={e => setSelectedContract(e.target.value)}
                        style={{ accentColor:"var(--accent-purple)" }}
                      />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:600 }}>{c.title}</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>Contract #{String(c.id).padStart(4,"0")}</div>
                      </div>
                      <span style={{ fontSize:15, fontWeight:700, color:"var(--accent-green)" }}>
                        {c.amount} USDC
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Upload zone */}
              <div className="card mb-6">
                <h2 style={{ fontSize:18, fontWeight:700, marginBottom:18 }}>Upload Deliverables</h2>

                <div
                  className={`upload-zone ${drag ? "drag-over" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    id="file-input"
                    ref={fileRef}
                    type="file"
                    multiple
                    style={{ display:"none" }}
                    onChange={e => handleFiles(e.target.files)}
                  />
                  <UploadCloud size={44} style={{ color: drag ? "var(--accent-purple)" : "var(--text-muted)", marginBottom:16, transition:"color 0.2s" }} />
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>
                    {drag ? "Drop files here!" : "Drag & Drop files here"}
                  </div>
                  <div style={{ fontSize:13, color:"var(--text-muted)" }}>
                    or <span style={{ color:"var(--accent-purple)", fontWeight:600 }}>browse files</span> — any format supported
                  </div>
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
                    {files.map((f, i) => (
                      <div key={i} style={{
                        display:"flex", alignItems:"center", gap:12,
                        padding:"10px 14px",
                        background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)",
                        borderRadius:10
                      }}>
                        <span style={{ fontSize:20 }}>{getFileIcon(f.type)}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600 }}>{f.name}</div>
                          <div style={{ fontSize:11, color:"var(--text-muted)" }}>{f.size}</div>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}
                        >
                          <X size={15}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="card mb-6">
                <h2 style={{ fontSize:18, fontWeight:700, marginBottom:14 }}>Submission Note</h2>
                <textarea
                  id="input-submission-note"
                  className="form-textarea"
                  placeholder="Describe what you've delivered, any notes for the client, access credentials (encrypted), etc."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              <button
                id="btn-upload-ipfs"
                className="btn btn-primary btn-lg"
                style={{ width:"100%" }}
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <><span className="spinner" /> Uploading to IPFS…</>
                ) : (
                  <><UploadCloud size={18}/> Submit Deliverable to IPFS</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
