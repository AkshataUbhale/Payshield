import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserCheck } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import FreelancerCard from "../../components/freelancers/FreelancerCard";
import * as api from "../../services/api";

export default function FreelancerRecommendations() {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadFreelancers() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        const res = await api.getFreelancers(token);
        const list = Array.isArray(res) ? res : res.freelancers || [];
        const mapped = list.map((f) => ({
          id: f.publicKey || f._id,
          name: f.name || f.username || `Dev (${f.publicKey.slice(0, 6)}...${f.publicKey.slice(-4)})`,
          skills: f.skills && f.skills.length > 0 ? f.skills : ["Solana", "Web3", "Full-Stack"],
          rating: 5.0,
          hourlyRate: f.hourlyRate || 50,
          completedJobs: f.completedProjects || 0,
          bio: f.bio || "Verified Solana & Web3 Developer available for escrow contracts.",
          location: f.location || "Global (Decentralized)",
        }));
        setFreelancers(mapped);
      } catch (err) {
        console.error("Failed to load freelancers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFreelancers();
  }, []);

  const filtered = freelancers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      (f.bio || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Find Freelancers</span>
            <span className="topbar-breadcrumb">{freelancers.length} registered specialists</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div className="page-container">
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              className="form-input input-with-icon"
              placeholder="Search by name, skill, or expertise…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", fontSize: 15, padding: "14px 16px 14px 44px" }}
            />
          </div>

          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> verified developer{filtered.length === 1 ? "" : "s"}
          </div>

          {loading ? (
            <div className="card text-center" style={{ color: "var(--text-muted)", padding: "2rem" }}>
              Loading registered freelancers...
            </div>
          ) : (
            <div className="grid-2">
              {filtered.map((f) => (
                <FreelancerCard key={f.id} freelancer={f} onClick={() => navigate(`/client/hire/${f.id}`)} />
              ))}
            </div>
          )}

          {!loading && !filtered.length && (
            <div className="card" style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <UserCheck size={36} style={{ margin: "0 auto 12px", color: "var(--text-muted)" }} />
              <div style={{ fontSize: 16, fontWeight: 600 }}>No freelancers found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try searching for other skills like React, Solana, or Rust.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
