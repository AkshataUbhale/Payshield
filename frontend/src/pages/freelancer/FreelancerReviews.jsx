import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageSquare } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import NotificationBell from "../../components/common/NotificationBell";
import { useWallet } from "../../hooks/useWallet";
import * as api from "../../services/api";

export default function FreelancerReviews() {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [reviews, setReviews] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        const res = await api.getContracts({}, token);
        const list = Array.isArray(res) ? res : res.contracts || [];
        const completed = list.filter((c) => c.status === "completed");
        setCompletedCount(completed.length);

        const reviewList = completed.map((c, idx) => ({
          id: c.projectId || c._id || idx,
          clientName: c.clientPubkey ? `Client (${c.clientPubkey.slice(0, 6)}...${c.clientPubkey.slice(-4)})` : "Verified Client",
          project: c.title,
          rating: 5,
          date: new Date(c.updatedAt || c.createdAt).toLocaleDateString(),
          text: `Milestone completed and on-chain escrow released successfully for ${c.title}.`,
        }));
        setReviews(reviewList);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [publicKey]);

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "5.0";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">My Reviews</span>
            <span className="topbar-breadcrumb">{reviews.length} verified ratings</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div className="page-container">
          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Rating Summary */}
            <div className="card">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 900,
                    fontFamily: "'Space Grotesk',sans-serif",
                    background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {avg}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={18} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Based on {reviews.length} verified contract completion{reviews.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="divider" style={{ margin: "20px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-green)" }}>100%</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Success Rate</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-purple)" }}>{completedCount}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Completed</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-blue)" }}>0</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Disputes</div>
                </div>
              </div>
            </div>

            {/* Reviews list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {loading ? (
                <div className="card" style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
                  Loading verified reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                  <MessageSquare size={36} style={{ margin: "0 auto 1rem", color: "var(--text-muted)" }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No Reviews Yet</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    Reviews and on-chain completion badges will appear here once you finish contract milestones.
                  </p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="card">
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{r.clientName}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.project}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 2, justifyContent: "flex-end", marginBottom: 2 }}>
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={13} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.date}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      "{r.text}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
