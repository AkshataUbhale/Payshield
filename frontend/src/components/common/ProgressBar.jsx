import React from "react";
import { Check } from "lucide-react";

export default function ProgressBar({ currentStep, totalSteps = 3, steps = [] }) {
  const defaultLabels = ["Basic Info", "Details & Skills", "Preferences"];
  const labels = steps.length > 0 ? steps : defaultLabels;

  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentStep - 1) / (totalSteps - 1)) * 100)
  );

  return (
    <div style={{ width: "100%", marginBottom: 32 }}>
      {/* Progress Track & Nodes */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Background track line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "5%",
            right: "5%",
            height: 4,
            transform: "translateY(-50%)",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: 2,
            zIndex: 0,
          }}
        />

        {/* Active progress fill line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "5%",
            width: `${progressPercent * 0.9}%`,
            height: 4,
            transform: "translateY(-50%)",
            background: "linear-gradient(90deg, #6366f1, #3b82f6)",
            borderRadius: 2,
            transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 0,
            boxShadow: "0 0 12px rgba(99, 102, 241, 0.5)",
          }}
        />

        {Array.from({ length: totalSteps }, (_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={stepNum}
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                  background: isCompleted
                    ? "var(--accent-green, #10b981)"
                    : isCurrent
                    ? "linear-gradient(135deg, #6366f1, #3b82f6)"
                    : "var(--bg-card, #1e293b)",
                  border: isCurrent
                    ? "2px solid #818cf8"
                    : isCompleted
                    ? "2px solid #10b981"
                    : "2px solid rgba(255, 255, 255, 0.12)",
                  color: isCompleted || isCurrent ? "#ffffff" : "var(--text-muted, #94a3b8)",
                  boxShadow: isCurrent
                    ? "0 0 16px rgba(99, 102, 241, 0.45)"
                    : isCompleted
                    ? "0 0 10px rgba(16, 185, 129, 0.3)"
                    : "none",
                }}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : stepNum}
              </div>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent
                    ? "var(--text-primary, #ffffff)"
                    : isCompleted
                    ? "var(--accent-green, #10b981)"
                    : "var(--text-muted, #64748b)",
                  whiteSpace: "nowrap",
                  transition: "color 0.25s ease",
                }}
              >
                {labels[idx] || `Step ${stepNum}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
