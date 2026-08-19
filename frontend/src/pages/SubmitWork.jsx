import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { UploadCloud, File, CheckCircle, X, Link, Hash, ArrowRight, MessageSquare } from "lucide-react";
import { uploadFiles } from "../services/ipfs";
import { getContracts, submitWork } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";

export default function SubmitWork() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shortAddress } = useWallet();
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState("");
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState("");
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const fileRef = useRef();

  // Load real contracts assigned to this freelancer
  useEffect(() => {
    const token = sessionStorage.getItem("ps_token");
    const myPubkey = user?.walletAddress || user?.id || (shortAddress ? shortAddress : null);
    if (!myPubkey && !token) {
      setContracts([]);
      return;
    }

    getContracts({ freelancerPubkey: myPubkey }, token)
      .then((data) => {
        const list = data.projects ?? data ?? [];
        if (Array.isArray(list)) {
          // Strictly show ONLY contracts where this freelancer is hired AND status is active (in_progress or submitted)
          const activeAssigned = list.filter((c) => {
            const isAssignedToMe =
              c.freelancerPubkey === myPubkey ||
              c.freelancerPubkey === user?.walletAddress ||
              c.freelancerPubkey === user?.id;
            const isActiveStatus = c.status === "in_progress" || c.status === "submitted";
            return isAssignedToMe && isActiveStatus;
          });
          setContracts(activeAssigned);
          if (activeAssigned.length > 0) {
            setSelectedContract(activeAssigned[0].projectId || activeAssigned[0]._id);
          } else {
            setSelectedContract("");
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load contracts for submission:", err);
        setContracts([]);
      });
  }, [user?.walletAddress, user?.id, shortAddress]);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList).map((f) => ({
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + " KB",
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...arr]);
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, j) => j !== i));

  const handleUpload = async () => {
    if (!selectedContract) {
      alert("Please select a contract first.");
      return;
    }
    if (!files.length && !note) {
      alert("Please attach at least one deliverable file or provide submission notes.");
      return;
    }
    setUploading(true);
    try {
      // 1. Upload files to IPFS or generate decentralized CID
      let ipfsHash = "";
      try {
        if (files.length > 0) {
          const rawFiles = files.map((f) => f.file);
          const results = await uploadFiles(rawFiles, selectedContract);
          ipfsHash = results[0]?.ipfsHash;
        }
      } catch (ipfsErr) {
        console.warn("Pinata upload fallback:", ipfsErr);
      }

      if (!ipfsHash) {
        throw new Error("IPFS upload failed — could not obtain a content hash for your files. Please check your Pinata API key or try again.");
      }

      // 2. Record submission in backend
      const token = sessionStorage.getItem("ps_token");
      await submitWork(
        {
          contractId: selectedContract,
          ipfsHash,
          note,
          fileCount: files.length || 1,
        },
        token,
      );

      const contract = contracts.find(
        (c) => String(c.projectId || c._id || c.id) === String(selectedContract),
      );

      setUploaded({
        hash: ipfsHash,
        contract: contract?.title ?? selectedContract,
        files: files.length,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes("image")) return "🖼️";
    if (type?.includes("pdf")) return "📄";
    if (type?.includes("zip") || type?.includes("compressed")) return "🗜️";
    return "📁";
  };

  return (
    <div className="app-layout">
      <Sidebar walletAddress={user?.walletAddress || shortAddress} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Submit Work</span>
            <span className="topbar-breadcrumb">Dashboard / Submit Deliverable</span>
          </div>
        </div>

        <div className="page-container" style={{ maxWidth: 760 }}>
          {uploaded ? (
            /* ── Success State ── */
            <div className="card animate-fadeInUp" style={{ textAlign: "center", padding: 48 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle size={36} style={{ color: "var(--accent-green)" }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-green)", marginBottom: 8 }}>
                Work Submitted to IPFS!
              </h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.7 }}>
                Your deliverables have been uploaded and recorded on-chain.<br />
                The client will be notified to review and approve payment.
              </p>

              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 24,
                  textAlign: "left",
                  marginBottom: 28,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {[
                    { l: "Contract", v: uploaded.contract },
                    { l: "Files", v: `${uploaded.files} file(s)` },
                    { l: "Timestamp", v: uploaded.timestamp },
                    { l: "Network", v: "IPFS (Decentralized)" },
                  ].map(({ l, v }) => (
                    <div key={l}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 3 }}>
                        {l.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="divider" />

                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>
                  <Hash size={11} style={{ display: "inline", marginRight: 4 }} />IPFS CONTENT HASH (CID)
                </div>
                <div className="hash-box">
                  <Link size={13} />
                  <span>{uploaded.hash}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  id="btn-view-contract-after-submit"
                  className="btn btn-primary"
                  onClick={() => navigate(`/contract/${selectedContract}`)}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  View Contract Status <ArrowRight size={14} />
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/freelancer/contracts")}
                >
                  My Active Contracts
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate("/chat")}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <MessageSquare size={14} /> Message Client
                </button>
                <button
                  id="btn-submit-another"
                  className="btn btn-ghost"
                  onClick={() => {
                    setUploaded(null);
                    setFiles([]);
                    setNote("");
                  }}
                >
                  Submit Another Deliverable
                </button>
              </div>
            </div>
          ) : (
            /* ── Upload Form ── */
            <>
              {/* Contract selector */}
              <div className="card mb-6 animate-fadeInUp">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Select Contract</h2>
                {contracts.length === 0 ? (
                  <div style={{ padding: "28px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📁</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                      No Active Contracts Assigned
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 440, margin: "0 auto 18px", lineHeight: 1.6 }}>
                      You don't have any active in-progress contracts yet. When a client accepts your proposal and deposits escrow, your project will appear here to upload deliverables.
                    </p>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate("/freelancer/jobs")}
                    >
                      Browse Open Jobs <ArrowRight size={13} style={{ marginLeft: 4 }} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {contracts.map((c) => {
                      const cId = c.projectId || c._id;
                      return (
                        <label
                          key={cId}
                          htmlFor={`contract-radio-${cId}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "14px 18px",
                            background:
                              selectedContract == cId
                                ? "rgba(99,102,241,0.1)"
                                : "rgba(255,255,255,0.02)",
                            border: `1px solid ${
                              selectedContract == cId
                                ? "rgba(99,102,241,0.3)"
                                : "var(--border)"
                            }`,
                            borderRadius: 10,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <input
                            type="radio"
                            id={`contract-radio-${cId}`}
                            name="contract"
                            value={cId}
                            checked={selectedContract == cId}
                            onChange={(e) => setSelectedContract(e.target.value)}
                            style={{ accentColor: "var(--accent-purple)" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              Contract #{String(cId).slice(0, 16)} · Status: {c.status}
                            </div>
                          </div>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-green)" }}>
                            {c.budget} USDC
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upload zone */}
              <div className="card mb-6">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Upload Deliverables</h2>

                <div
                  className={`upload-zone ${drag ? "drag-over" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    id="file-input"
                    ref={fileRef}
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <UploadCloud
                    size={44}
                    style={{
                      color: drag ? "var(--accent-purple)" : "var(--text-muted)",
                      marginBottom: 16,
                      transition: "color 0.2s",
                    }}
                  />
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                    {drag ? "Drop files here!" : "Drag & Drop files here"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    or <span style={{ color: "var(--accent-purple)", fontWeight: 600 }}>browse files</span> — any format supported
                  </div>
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    {files.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{getFileIcon(f.type)}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.size}</div>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                          }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="card mb-6">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Submission Note</h2>
                <textarea
                  id="input-submission-note"
                  className="form-textarea"
                  placeholder="Describe what you've delivered, any notes for the client, GitHub PR links, access credentials (encrypted), etc."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button
                id="btn-upload-ipfs"
                className="btn btn-primary btn-lg"
                style={{ width: "100%" }}
                onClick={handleUpload}
                disabled={uploading || !selectedContract}
              >
                {uploading ? (
                  <><span className="spinner" /> Uploading Deliverable…</>
                ) : (
                  <><UploadCloud size={18} /> Submit Deliverable</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
