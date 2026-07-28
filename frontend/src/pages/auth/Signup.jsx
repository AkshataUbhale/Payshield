import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Shield, Chrome, Eye, EyeOff, ArrowLeft, User, Briefcase } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [role, setRole] = useState("freelancer");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSignup = () => {
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    setTimeout(() => {
      signup(form.name, form.email, form.password, role);
      setLoading(false);
      navigate(role === "client" ? "/client/dashboard" : "/freelancer/dashboard");
    }, 1000);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-primary)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative"
    }}>
      <div style={{ position:"fixed",top:"-20%",left:"-10%",width:500,height:500,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)",pointerEvents:"none" }} />

      <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}
        style={{ position: "fixed", top: 20, left: 20 }}>
        <ArrowLeft size={14} /> Home
      </button>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#6366f1,#3b82f6)",
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",
            boxShadow:"0 8px 24px rgba(99,102,241,0.4)" }}>
            <Shield size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Create Account</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Join PayShield today</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Role selector */}
          <div style={{ display:"flex",gap:0,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3,marginBottom:24 }}>
            {[{id:"freelancer",label:"Freelancer",Icon:User},{id:"client",label:"Client / Employer",Icon:Briefcase}].map(r => (
              <button key={r.id} onClick={() => setRole(r.id)} style={{
                flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:600, fontFamily:"Inter,sans-serif", display:"flex",
                alignItems:"center", justifyContent:"center", gap:6,
                background: role === r.id ? "linear-gradient(135deg,#6366f1,#3b82f6)" : "transparent",
                color: role === r.id ? "white" : "var(--text-muted)", transition:"all 0.2s ease"
              }}>
                <r.Icon size={13} /> {r.label}
              </button>
            ))}
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="input-name" type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={set("name")} />
          </div>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <Mail className="input-icon" size={15} />
              <input id="input-email" type="email" className="form-input input-with-icon"
                placeholder="you@example.com" value={form.email} onChange={set("email")} />
            </div>
          </div>
          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input id="input-password" type={showPass ? "text" : "password"} className="form-input"
                placeholder="Min 8 characters" value={form.password} onChange={set("password")} style={{ paddingRight: 42 }} />
              <button onClick={() => setShowPass(!showPass)} style={{
                position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)"
              }}>
                {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>
          {/* Confirm */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input id="input-confirm" type="password" className="form-input"
              placeholder="••••••••" value={form.confirm} onChange={set("confirm")} />
          </div>

          {error && <div style={{ color:"var(--accent-red)",fontSize:13,marginBottom:14,textAlign:"center" }}>{error}</div>}

          <button id="btn-signup" className="btn btn-primary" style={{ width:"100%",height:44 }}
            onClick={handleSignup} disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>

          <div style={{ textAlign:"center",marginTop:16,fontSize:13,color:"var(--text-muted)" }}>
            Already have an account?{" "}
            <span style={{ color:"var(--accent-purple)",cursor:"pointer",fontWeight:600 }}
              onClick={() => navigate("/login")}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
