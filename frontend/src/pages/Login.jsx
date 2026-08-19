import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Login() {
  const navigate = useNavigate();
  const { loginWithWallet } = useAuth();
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const didAttempt = useRef(false); // prevent double-fire on StrictMode re-mount

  const redirectForRole = (user) => {
    if (user.role === "client")          navigate("/client/dashboard");
    else if (user.role === "freelancer") navigate("/freelancer/dashboard");
    else                                 navigate("/role");
  };

  useEffect(() => {
    // Reset guard when wallet disconnects so next connect retriggers
    if (!connected || !publicKey) {
      didAttempt.current = false;
      return;
    }
    if (didAttempt.current) return;
    didAttempt.current = true;

    const doLogin = async () => {
      setLoading(true);
      setError(null);
      try {
        const address = publicKey.toBase58();
        // 12-second hard timeout — no more infinite spinner
        const user = await Promise.race([
          loginWithWallet(address),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(
              "Request timed out. Is the backend running?\ncd backend && npm run dev"
            )), 12000)
          ),
        ]);
        redirectForRole(user);
      } catch (err) {
        setError(err.message || "Authentication failed. Please try again.");
        didAttempt.current = false; // allow retry
      } finally {
        setLoading(false);
      }
    };
    doLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]);

  const handleRetry = () => {
    if (!connected || !publicKey) return;
    setError(null);
    setLoading(true);
    didAttempt.current = true;
    loginWithWallet(publicKey.toBase58())
      .then(redirectForRole)
      .catch(err => { setError(err.message || "Authentication failed"); didAttempt.current = false; })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--gradient-hero)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative"
    }}>
      <div style={{ position:"fixed", top:"-20%", left:"-10%", width:500, height:500,
        borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-15%", right:"-5%", width:400, height:400,
        borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.05),transparent 70%)", pointerEvents:"none" }} />

      <button id="btn-back-home" className="btn btn-ghost btn-sm" onClick={() => navigate("/")}
        style={{ position:"fixed", top:20, left:20 }}>
        <ArrowLeft size={14} /> Home
      </button>

      <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, borderRadius:14,
            background:"linear-gradient(135deg,#6366f1,#3b82f6)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 14px", boxShadow:"0 8px 24px rgba(99,102,241,0.4)" }}>
            <Shield size={24} color="white" />
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>PayShield</h1>
          <p style={{ fontSize:13, color:"var(--text-muted)" }}>Secure Blockchain Escrow Platform</p>
        </div>

        <div className="card" style={{ padding:40, textAlign:"center" }}>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:12 }}>Welcome to PayShield</h2>
          <p style={{ fontSize:14, color:"var(--text-muted)", marginBottom:32, lineHeight:1.6 }}>
            Connect your Phantom or Solflare wallet. You will sign a one-time message to verify ownership — no password needed.
          </p>

          <div style={{ display:"flex", justifyContent:"center" }} className="solana-auth-button-container">
            <WalletMultiButton style={{
              width:"100%", height:46, justifyContent:"center",
              borderRadius:10, fontFamily:"Inter,sans-serif", fontSize:14, fontWeight:600
            }} />
          </div>

          {loading && (
            <div style={{ marginTop:24, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <span className="spinner" />
              <span style={{ fontSize:13, color:"var(--text-muted)" }}>Verifying wallet signature…</span>
            </div>
          )}

          {error && !loading && (
            <div style={{
              marginTop:20, background:"rgba(239,68,68,0.08)",
              border:"1px solid rgba(239,68,68,0.25)", borderRadius:10,
              padding:"14px 16px", display:"flex", flexDirection:"column", gap:10, textAlign:"left"
            }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <AlertTriangle size={16} color="#ef4444" style={{ marginTop:1, flexShrink:0 }} />
                <span style={{ fontSize:13, color:"#fca5a5", lineHeight:1.5, whiteSpace:"pre-line" }}>{error}</span>
              </div>
              {connected && (
                <button id="btn-retry-login" className="btn btn-ghost btn-sm" onClick={handleRetry}
                  style={{ alignSelf:"flex-end", color:"var(--accent-purple)", gap:6 }}>
                  <RefreshCw size={13} /> Retry
                </button>
              )}
            </div>
          )}

          {connected && !loading && !error && (
            <p style={{ marginTop:16, fontSize:12, color:"var(--text-muted)" }}>
              ✅ Wallet connected — check Phantom for the sign request
            </p>
          )}
        </div>

        <p style={{ textAlign:"center", fontSize:12, color:"var(--text-muted)", marginTop:20 }}>
          By continuing, you agree to PayShield's Terms of Service and Privacy Policy.
        </p>

        <div style={{
          marginTop:16, padding:"10px 16px",
          background:"rgba(99,102,241,0.05)", borderRadius:8,
          border:"1px solid rgba(99,102,241,0.12)"
        }}>
          <p style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.6, margin:0, textAlign:"center" }}>
            Backend must be running before connecting the wallet<br />
            <code style={{ fontSize:11, color:"var(--accent-purple)" }}>cd backend &amp;&amp; npm run dev</code>
          </p>
        </div>
      </div>
    </div>
  );
}
