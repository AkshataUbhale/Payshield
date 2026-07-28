import { useNavigate } from "react-router-dom";
import { Star, TrendingUp } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";

const REVIEWS = [
  { id: 1, clientName: "TechCorp Inc.",   project: "React Dashboard",      rating: 5, date: "Mar 2026",
    text: "Exceptional work! Delivered 2 days early, excellent code quality." },
  { id: 2, clientName: "DeFi Labs",       project: "Solidity Token Contract", rating: 5, date: "Feb 2026",
    text: "Deep Web3 expertise. Will definitely hire again for our next smart contract." },
  { id: 3, clientName: "StartupHQ",       project: "SaaS UI Mockups",       rating: 4, date: "Jan 2026",
    text: "Great designs. Needed one round of revision but final output was excellent." },
  { id: 4, clientName: "AI Research Ltd.", project: "ML Pipeline",           rating: 5, date: "Dec 2025",
    text: "Outstanding Python skills. The pipeline is running in production with no issues." },
  { id: 5, clientName: "CloudSys Inc.",   project: "DevOps Setup",          rating: 5, date: "Nov 2025",
    text: "Set up our entire K8s cluster flawlessly. Highly professional." },
];

const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

export default function FreelancerReviews() {
  const navigate = useNavigate();
  const dist = [5,4,3,2,1].map(n => ({
    stars: n, count: REVIEWS.filter(r => r.rating === n).length,
    pct: Math.round((REVIEWS.filter(r => r.rating === n).length / REVIEWS.length) * 100),
  }));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">My Reviews</span>
            <span className="topbar-breadcrumb">{REVIEWS.length} reviews from clients</span>
          </div>
          <div className="topbar-right"><NotificationBell /></div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Rating Summary */}
            <div className="card">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  fontSize: 64, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif",
                  background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>{avg}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 6 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={18} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Based on {REVIEWS.length} reviews</div>
              </div>

              {/* Distribution */}
              {dist.map(d => (
                <div key={d.stars} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 2, width: 72, justifyContent: "flex-end" }}>
                    {Array.from({ length: d.stars }).map((_, i) => (
                      <Star key={i} size={11} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                    ))}
                  </div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", height: 8, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${d.pct}%`, height: "100%", background: "linear-gradient(90deg,#f59e0b,#f97316)", borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", width: 28 }}>{d.count}</div>
                </div>
              ))}

              <div className="divider" style={{ margin: "20px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-green)" }}>98%</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Job Success</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-purple)" }}>34</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Jobs Done</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-blue)" }}>0</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Disputes</div>
                </div>
              </div>
            </div>

            {/* Reviews list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {REVIEWS.map(r => (
                <div key={r.id} className="card">
                  <div className="flex-between" style={{ marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{r.clientName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.project}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 2, justifyContent: "flex-end", marginBottom: 2 }}>
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={12} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.date}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>
                    "{r.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
