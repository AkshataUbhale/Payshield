import { X } from "lucide-react";

export default function Modal({ title, children, onClose, maxWidth = 520 }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 900,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)"
        }}
      />
      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 901, width: "90%", maxWidth,
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)", borderRadius: 18,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        animation: "modalIn 0.2s ease"
      }}>
        {/* Header */}
        {title && (
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h2>
            <button onClick={onClose} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", borderRadius: 8, padding: 4
            }}>
              <X size={18} />
            </button>
          </div>
        )}
        {/* Body */}
        <div style={{ padding: 24 }}>{children}</div>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translate(-50%,-48%); } to { opacity:1; transform:translate(-50%,-50%); } }`}</style>
      </div>
    </>
  );
}
