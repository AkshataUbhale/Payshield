export default function SkillTag({ skill, size = "sm" }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: size === "sm" ? "3px 10px" : "5px 14px",
      borderRadius: 20,
      background: "rgba(99,102,241,0.1)",
      border: "1px solid rgba(99,102,241,0.2)",
      color: "var(--accent-purple)",
      fontSize: size === "sm" ? 11 : 12,
      fontWeight: 600,
      letterSpacing: 0.2,
      whiteSpace: "nowrap",
    }}>
      {skill}
    </span>
  );
}
