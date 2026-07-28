import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

const SKILL_OPTIONS = [
  "React", "Node.js", "Solidity", "Python", "UI/UX", "Figma",
  "TypeScript", "Vue", "GraphQL", "MongoDB", "AWS", "DevOps",
];

const BUDGET_RANGES = [
  { label: "Any Budget", min: 0, max: Infinity },
  { label: "< 200 USDC", min: 0, max: 200 },
  { label: "200–500 USDC", min: 200, max: 500 },
  { label: "500–1000 USDC", min: 500, max: 1000 },
  { label: "1000+ USDC", min: 1000, max: Infinity },
];

export default function JobFilter({ onFilter }) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [budgetIdx, setBudgetIdx] = useState(0);
  const [open, setOpen] = useState(false);

  const toggleSkill = (skill) => {
    const next = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(next);
    onFilter?.({ skills: next, budget: BUDGET_RANGES[budgetIdx] });
  };

  const handleBudget = (idx) => {
    setBudgetIdx(idx);
    onFilter?.({ skills: selectedSkills, budget: BUDGET_RANGES[idx] });
  };

  const clearAll = () => {
    setSelectedSkills([]);
    setBudgetIdx(0);
    onFilter?.({ skills: [], budget: BUDGET_RANGES[0] });
  };

  return (
    <div className="card card-sm" style={{ marginBottom: 20 }}>
      <div className="flex-between" style={{ marginBottom: open ? 16 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SlidersHorizontal size={16} color="var(--accent-purple)" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Filters</span>
          {(selectedSkills.length > 0 || budgetIdx > 0) && (
            <span style={{
              background: "var(--accent-purple)", color: "white",
              borderRadius: "50%", width: 18, height: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700
            }}>
              {selectedSkills.length + (budgetIdx > 0 ? 1 : 0)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(selectedSkills.length > 0 || budgetIdx > 0) && (
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>
              <X size={12} /> Clear
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(!open)}>
            {open ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      {open && (
        <>
          {/* Budget Filter */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, letterSpacing: 0.5 }}>
              BUDGET RANGE
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {BUDGET_RANGES.map((r, i) => (
                <button
                  key={r.label}
                  onClick={() => handleBudget(i)}
                  style={{
                    padding: "5px 12px", borderRadius: 20,
                    border: `1px solid ${budgetIdx === i ? "var(--accent-purple)" : "var(--border)"}`,
                    background: budgetIdx === i ? "rgba(99,102,241,0.15)" : "transparent",
                    color: budgetIdx === i ? "var(--accent-purple)" : "var(--text-secondary)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Filter */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, letterSpacing: 0.5 }}>
              SKILLS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SKILL_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  style={{
                    padding: "5px 12px", borderRadius: 20,
                    border: `1px solid ${selectedSkills.includes(s) ? "var(--accent-purple)" : "var(--border)"}`,
                    background: selectedSkills.includes(s) ? "rgba(99,102,241,0.15)" : "transparent",
                    color: selectedSkills.includes(s) ? "var(--accent-purple)" : "var(--text-secondary)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
