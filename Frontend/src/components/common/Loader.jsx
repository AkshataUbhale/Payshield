export default function Loader({ text = "Loading…" }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "60vh", gap: 16
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "3px solid rgba(99,102,241,0.2)",
        borderTopColor: "var(--accent-purple)",
        animation: "spin 0.8s linear infinite"
      }} />
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{text}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
