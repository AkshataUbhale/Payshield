import { useState, useRef, useEffect } from "react";
import { chatWithAiCopilot } from "../services/api";

/**
 * AIChatCopilot — Global floating AI assistant widget
 * Appears on every authenticated page. Supports natural language queries
 * to the PayShield AI Agent (Solana RPC, GitHub PoW, Platform Rules).
 */
export default function AIChatCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the PayShield AI Copilot. Ask me anything about your Solana transactions, GitHub milestone progress, or platform escrow rules.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolCalls, setToolCalls] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setToolCalls([]);

    try {
      const response = await chatWithAiCopilot(trimmed, []);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply },
      ]);
      if (response.toolCallsExecuted?.length > 0) {
        setToolCalls(response.toolCallsExecuted);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${err.message || "Failed to reach AI backend. Make sure the server is running on port 3001."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "What is PayShield's escrow refund policy?",
    "Audit github.com/AkshataUbhale/Payshield for proof of work",
    "Explain the milestone auto-release rule",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="ai-copilot-fab"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #3b82f6)",
          border: "none",
          color: "white",
          fontSize: 26,
          cursor: "pointer",
          boxShadow: "0 6px 28px rgba(99, 102, 241, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 8px 36px rgba(99, 102, 241, 0.7)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 6px 28px rgba(99, 102, 241, 0.5)";
        }}
        title="PayShield AI Copilot"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div
          id="ai-copilot-drawer"
          style={{
            position: "fixed",
            bottom: 100,
            right: 28,
            zIndex: 9998,
            width: 400,
            maxHeight: "70vh",
            borderRadius: 20,
            background: "#0f1320",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            boxShadow: "0 12px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(99, 102, 241, 0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "'Inter', -apple-system, sans-serif",
            animation: "copilotSlideUp 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.1))",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>
                PayShield AI Copilot
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                Solana RPC · GitHub MCP · RAG Knowledge
              </div>
            </div>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
              }}
            />
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 250,
              maxHeight: "calc(70vh - 200px)",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                        : "rgba(255, 255, 255, 0.06)",
                    border: msg.role === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.06)",
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: "#e2e8f0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Tool Calls Badge */}
            {toolCalls.length > 0 && (
              <div
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 2,
                }}
              >
                {toolCalls.map((tc, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      padding: "3px 8px",
                      borderRadius: 8,
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#34d399",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    ⚡ {tc.toolName.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 14px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  fontSize: 13,
                  color: "#94a3b8",
                }}
              >
                <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
                  <span className="copilot-dot" style={{ animationDelay: "0ms" }}>●</span>
                  <span className="copilot-dot" style={{ animationDelay: "200ms" }}>●</span>
                  <span className="copilot-dot" style={{ animationDelay: "400ms" }}>●</span>
                  <span style={{ marginLeft: 6 }}>Querying tools...</span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div
              style={{
                padding: "0 16px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.15)",
                    color: "#a5b4fc",
                    fontSize: 11.5,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)")
                  }
                >
                  → {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div
            style={{
              padding: "10px 14px 14px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about transactions, milestones, rules..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#f0f4ff",
                fontSize: 13,
                outline: "none",
                transition: "border 0.15s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(99, 102, 241, 0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")
              }
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background:
                  loading || !input.trim()
                    ? "rgba(255, 255, 255, 0.05)"
                    : "linear-gradient(135deg, #6366f1, #3b82f6)",
                border: "none",
                color: "white",
                fontSize: 16,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "opacity 0.15s",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Inline Keyframe Animations */}
      <style>{`
        @keyframes copilotSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes copilotPulse {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 1; }
        }
        .copilot-dot {
          animation: copilotPulse 1.2s infinite;
          font-size: 10px;
          color: #6366f1;
        }
      `}</style>
    </>
  );
}
