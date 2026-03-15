import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Shield, Chrome, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithWallet } = useAuth();
  const { connect } = useWallet();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState("login"); // login | signup

  const redirectForRole = (user) => {
    if (user.role === "client") navigate("/client/dashboard");
    else if (user.role === "freelancer") navigate("/freelancer/dashboard");
    else navigate("/role"); // no role yet → select
  };

  const handleEmailLogin = () => {
    if (!email || !password) { alert("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => {
      const user = login(email, password);
      setLoading(false);
      redirectForRole(user);
    }, 1000);
  };

  const handleMetaMask = async () => {
    setLoading(true);
    try {
      let address;
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        address = accounts[0];
      } else {
        // Demo fallback
        address = "0xA1B2C3D4E5F67890ABCDEF1234567890ABCDEF12";
      }
      await connect();
      const user = loginWithWallet(address);
      setLoading(false);
      navigate("/role");
    } catch {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      const user = login("google@demo.com", "demo");
      setLoading(false);
      navigate("/role");
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--gradient-hero)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative"
    }}>
      {/* Glow blobs */}
      <div style={{ position:"fixed", top:"-20%", left:"-10%", width:500, height:500,
        borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-15%", right:"-5%", width:400, height:400,
        borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.05),transparent 70%)", pointerEvents:"none" }} />

      {/* Back */}
      <button id="btn-back-home" className="btn btn-ghost btn-sm" onClick={() => navigate("/")}
        style={{ position:"fixed", top:20, left:20 }}>
        <ArrowLeft size={14} /> Home
      </button>

      <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52,height:52,borderRadius:14,
            background:"linear-gradient(135deg,#6366f1,#3b82f6)",
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 14px", boxShadow:"0 8px 24px rgba(99,102,241,0.4)" }}>
            <Shield size={24} color="white" />
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>PayShield</h1>
          <p style={{ fontSize:13, color:"var(--text-muted)" }}>Secure Blockchain Escrow Platform</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding:32 }}>
          {/* Tabs */}
          <div style={{ display:"flex",gap:0,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3,marginBottom:28 }}>
            {["login","signup"].map(t => (
              <button key={t} id={`tab-${t}`} onClick={() => setTab(t)} style={{
                flex:1, padding:"9px 0", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:13, fontWeight:600, fontFamily:"Inter,sans-serif",
                background: tab === t ? "linear-gradient(135deg,#6366f1,#3b82f6)" : "transparent",
                color: tab === t ? "white" : "var(--text-muted)",
                transition:"all 0.2s ease",
                boxShadow: tab === t ? "0 2px 8px rgba(99,102,241,0.35)" : "none"
              }}>
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <Mail className="input-icon" size={15} />
              <input id="input-email" type="email" className="form-input input-with-icon"
                placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input id="input-password" type={showPass ? "text" : "password"} className="form-input"
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                style={{ paddingRight:42 }} />
              <button onClick={() => setShowPass(!showPass)} style={{
                position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)"
              }}>
                {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {/* CTA */}
          <button id="btn-email-login" className="btn btn-primary"
            style={{ width:"100%", marginBottom:16, height:44 }}
            onClick={tab === "signup" ? () => navigate("/signup") : handleEmailLogin}
            disabled={loading}>
            {loading ? <span className="spinner"/> : (tab === "login" ? "Sign In" : "Create Account →")}
          </button>

          {/* Demo hint */}
          <div style={{ fontSize:11, color:"var(--text-muted)", textAlign:"center", marginBottom:16 }}>
            Demo: <code>freelancer@demo.com</code> or <code>client@demo.com</code> (any password)
          </div>

          {/* Divider */}
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
            <div style={{ flex:1,height:1,background:"var(--border)" }} />
            <span style={{ fontSize:12,color:"var(--text-muted)",flexShrink:0 }}>or continue with</span>
            <div style={{ flex:1,height:1,background:"var(--border)" }} />
          </div>

          {/* Social */}
          <div style={{ display:"flex",gap:10 }}>
            <button id="btn-google-login" className="btn btn-ghost" style={{ flex:1,height:44 }}
              onClick={handleGoogle} disabled={loading}>
              <Chrome size={16}/> Google
            </button>
            <button id="btn-metamask-login" className="btn btn-secondary" style={{ flex:1,height:44 }}
              onClick={handleMetaMask} disabled={loading}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                alt="MetaMask" style={{ width:18,height:18 }} />
              MetaMask
            </button>
          </div>
        </div>

        <p style={{ textAlign:"center",fontSize:12,color:"var(--text-muted)",marginTop:20 }}>
          By continuing, you agree to PayShield's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
