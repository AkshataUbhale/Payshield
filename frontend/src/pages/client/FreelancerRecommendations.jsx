import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import FreelancerCard from "../../components/freelancers/FreelancerCard";
import JobFilter from "../../components/jobs/JobFilter";

const ALL_FREELANCERS = [
  { id: "f1", name: "Alex Johnson",    skills: ["React","Node.js","TypeScript","Web3"], rating: 4.9, hourlyRate: 45, completedJobs: 34,
    bio: "Full-stack developer specializing in React and blockchain integrations.", location: "USA" },
  { id: "f2", name: "Priya Sharma",    skills: ["Solidity","Ethereum","Web3","DeFi"],   rating: 4.7, hourlyRate: 60, completedJobs: 22,
    bio: "Smart contract developer with 3 years of DeFi and NFT experience.", location: "India" },
  { id: "f3", name: "Carlos Rivera",   skills: ["Figma","UI/UX","Prototyping","CSS"],   rating: 4.8, hourlyRate: 35, completedJobs: 51,
    bio: "UI/UX designer crafting delightful, conversion-focused digital experiences.", location: "Spain" },
  { id: "f4", name: "Yuki Tanaka",     skills: ["Python","TensorFlow","AWS","Data"],    rating: 4.6, hourlyRate: 55, completedJobs: 18,
    bio: "ML engineer building production-grade models for real-world applications.", location: "Japan" },
  { id: "f5", name: "Omar Khalid",     skills: ["DevOps","Docker","Kubernetes","AWS"],  rating: 4.9, hourlyRate: 65, completedJobs: 40,
    bio: "Cloud infrastructure expert. CI/CD pipelines, microservices, and Kubernetes.", location: "UAE" },
  { id: "f6", name: "Sophie Müller",   skills: ["Vue","GraphQL","TypeScript","Node.js"],rating: 4.7, hourlyRate: 40, completedJobs: 27,
    bio: "Frontend architect with specialization in Vue and GraphQL architecture.", location: "Germany" },
];

export default function FreelancerRecommendations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = ALL_FREELANCERS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    (f.bio || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Find Freelancers</span>
            <span className="topbar-breadcrumb">{ALL_FREELANCERS.length} talented professionals</span>
          </div>
          <div className="topbar-right"><NotificationBell /></div>
        </div>

        <div className="page-container">
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="form-input input-with-icon"
              placeholder="Search by name, skill, or expertise…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", fontSize: 15, padding: "14px 16px 14px 44px" }} />
          </div>

          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> freelancers
          </div>

          <div className="grid-2">
            {filtered.map(f => (
              <FreelancerCard key={f.id} freelancer={f} onClick={() => navigate(`/client/hire/${f.id}`)} />
            ))}
          </div>

          {!filtered.length && (
            <div className="card" style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👩‍💻</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No freelancers found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
