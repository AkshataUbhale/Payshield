// ── Address formatting ───────────────────────────────────────────────────────
export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

// ── Currency / number formatting ─────────────────────────────────────────────
export const formatUSDC = (amount) =>
  `${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0 })} USDC`;

export const formatUSD = (amount) =>
  `$${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

// ── Date formatting ───────────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export const daysLeft = (deadline) => {
  const diff = new Date(deadline) - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  return `${days}d left`;
};

// ── Skill matching (for job recommendations) ──────────────────────────────────
export const getMatchScore = (jobSkills = [], freelancerSkills = []) => {
  const normalised = (arr) => arr.map(s => s.toLowerCase().trim());
  const jSkills = normalised(jobSkills);
  const fSkills = normalised(freelancerSkills);
  const matches = jSkills.filter(s => fSkills.includes(s));
  return jSkills.length ? Math.round((matches.length / jSkills.length) * 100) : 0;
};

// ── Status helpers ────────────────────────────────────────────────────────────
export const statusColor = {
  Active:    "var(--accent-green)",
  Pending:   "var(--accent-amber)",
  Completed: "var(--accent-purple)",
  Submitted: "var(--accent-blue)",
  Disputed:  "var(--accent-red)",
  Open:      "var(--accent-cyan)",
  Closed:    "var(--text-muted)",
};

export const statusBadgeClass = (status) => {
  const map = {
    Active: "badge-active", Pending: "badge-pending",
    Disputed: "badge-disputed", Completed: "badge-completed",
    Submitted: "badge-submitted",
  };
  return map[status] || "badge-pending";
};

// ── Truncate text ─────────────────────────────────────────────────────────────
export const truncate = (str, n = 80) =>
  str && str.length > n ? str.slice(0, n) + "…" : str;

// ── Generate random ID ────────────────────────────────────────────────────────
export const genId = () => Math.random().toString(36).slice(2, 9);
