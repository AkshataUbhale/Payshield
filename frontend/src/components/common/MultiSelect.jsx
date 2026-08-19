import React, { useState } from "react";
import { X, Plus, Check } from "lucide-react";

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select or type skills...",
  allowCustom = true,
  maxItems = 15,
}) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSelect = (item) => {
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      if (value.length < maxItems) {
        onChange([...value, item]);
      }
    }
  };

  const handleRemove = (e, item) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== item));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() && allowCustom) {
      e.preventDefault();
      const customItem = inputValue.trim();
      if (!value.includes(customItem) && value.length < maxItems) {
        onChange([...value, customItem]);
      }
      setInputValue("");
    }
  };

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(opt)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {/* Selected tags chip area */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          minHeight: 44,
          padding: "6px 12px",
          background: "var(--bg-card, #1e293b)",
          border: isFocused
            ? "1px solid var(--accent-purple, #6366f1)"
            : "1px solid var(--border, rgba(255, 255, 255, 0.1))",
          borderRadius: 10,
          alignItems: "center",
          boxShadow: isFocused ? "0 0 0 2px rgba(99, 102, 241, 0.2)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onClick={() => {
          const inputEl = document.getElementById("multiselect-input");
          if (inputEl) inputEl.focus();
        }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 8px",
              background: "rgba(99, 102, 241, 0.18)",
              color: "#a5b4fc",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => handleRemove(e, tag)}
              style={{
                background: "transparent",
                border: "none",
                color: "#a5b4fc",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                lineHeight: 1,
              }}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <input
          id="multiselect-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          style={{
            flex: 1,
            minWidth: 120,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary, #ffffff)",
            fontSize: 13,
            padding: "4px 0",
          }}
        />
      </div>

      {/* Suggested Quick Tags */}
      {options.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted, #94a3b8)", marginBottom: 6, display: "block" }}>
            Suggested:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {options.slice(0, 10).map((opt) => {
              const isSelected = value.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    background: isSelected
                      ? "rgba(99, 102, 241, 0.25)"
                      : "rgba(255, 255, 255, 0.04)",
                    color: isSelected ? "#ffffff" : "var(--text-secondary, #cbd5e1)",
                    border: isSelected
                      ? "1px solid var(--accent-purple, #6366f1)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 20,
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSelected ? <Check size={12} color="#818cf8" /> : <Plus size={12} />}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
