// Simple sparkline-style earnings chart using SVG
// Data: array of { month, amount }
export default function EarningsChart({ data = [] }) {
  if (!data.length) return null;

  const max = Math.max(...data.map(d => d.amount), 1);
  const W = 320, H = 80;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (W - 24) + 12;
    const y = H - (d.amount / max) * (H - 16) - 8;
    return { x, y, ...d };
  });

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillD = `${pathD} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 80 }}>
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#chartFill)" />
        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#6366f1" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {data.map(d => (
          <span key={d.month} style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.month}</span>
        ))}
      </div>
    </div>
  );
}
