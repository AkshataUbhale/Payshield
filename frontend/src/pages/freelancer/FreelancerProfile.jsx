import { useNavigate } from "react-router-dom";
import { Star, Edit, ExternalLink } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import SkillTag from "../../components/freelancers/SkillTag";
import PortfolioCard from "../../components/freelancers/PortfolioCard";
import EarningsChart from "../../components/dashboard/EarningsChart";
import { useAuth } from "../../hooks/useAuth";

const SKILLS = ["React", "Node.js", "TypeScript", "Solidity", "Web3", "MongoDB", "Figma"];
const PORTFOLIO = [
  { title: "DeFi Dashboard", description: "Analytics dashboard for DeFi protocol with real-time data.",
    tech: ["React", "Node.js", "Web3"], link: "#" },
  { title: "NFT Marketplace UI", description: "Full UI design and frontend for NFT trading platform.",
    tech: ["React", "Ethers.js", "IPFS"], link: "#" },
  { title: "Smart Contract Audit Tool", description: "Automated Solidity code auditing tool with AI recommendations.",
    tech: ["Python", "Solidity", "GPT-4"], link: "#" },
];
const REVIEWS = [
  { name: "TechCorp Inc.", rating: 5, text: "Excellent work! Delivered ahead of schedule. Highly recommended.", date: "Feb 2026" },
  { name: "DeFi Labs",     rating: 5, text: "Deep knowledge of Web3. Will hire again for future contracts.", date: "Jan 2026" },
  { name: "StartupHQ",    rating: 4, text: "Great communication and quality output. Minor revision needed.", date: "Dec 2025" },
];
const CHART = [
  { month: "Oct", amount: 800 }, { month: "Nov", amount: 1200 }, { month: "Dec", amount: 950 },
  { month: "Jan", amount: 1600 }, { month: "Feb", amount: 1100 }, { month: "Mar", amount: 1800 },
];

export default function FreelancerProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">My Profile</span>
            <span className="topbar-breadcrumb">Public freelancer profile</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/freelancer/edit-profile")}>
              <Edit size={14} /> Edit Profile
            </button>
          </div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Profile Card */}
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
                  background: "linear-gradient(135deg,#6366f1,#3b82f6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, fontWeight: 700, color: "white",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.4)"
                }}>
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{user?.name || "Alex Johnson"}</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                  Full Stack & Blockchain Developer
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                  ))}
                  <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>(4.9) · 34 reviews</span>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-green)" }}>34</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Jobs Done</div>
                  </div>
                  <div style={{ width: 1, background: "var(--border)" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-purple)" }}>$45</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Per Hour</div>
                  </div>
                  <div style={{ width: 1, background: "var(--border)" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-blue)" }}>98%</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Success</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  Full-stack developer and smart contract engineer with 4+ years in Web3. Specialized in DeFi, 
                  NFT, and decentralized applications on Ethereum and Polygon.
                </p>
              </div>

              {/* Skills */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Skills</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SKILLS.map(s => <SkillTag key={s} skill={s} size="md" />)}
                </div>
              </div>

              {/* Earnings chart */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Earnings (6 months)</h3>
                <EarningsChart data={CHART} />
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Portfolio */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Portfolio</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {PORTFOLIO.map(p => <PortfolioCard key={p.title} item={p} />)}
                </div>
              </div>

              {/* Reviews */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent Reviews</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {REVIEWS.map(r => (
                    <div key={r.name} style={{ paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                      <div className="flex-between" style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                        <div style={{ display: "flex", gap: 3 }}>
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={12} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                          ))}
                          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>{r.date}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
