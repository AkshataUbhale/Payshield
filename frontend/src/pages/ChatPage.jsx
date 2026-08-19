import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/common/NotificationBell";
import { Send, Search, Lock, Paperclip, Smile, ShieldCheck, MessageSquare } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";
import * as api from "../services/api";

// ── Sub-components ──────────────────────────────────────────────────────────
function ContactItem({ contact, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        cursor: "pointer", borderRadius: 12, transition: "all 0.2s ease",
        background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
        borderLeft: isActive ? "2px solid #6366f1" : "2px solid transparent",
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 16, color: "white"
        }}>
          {contact.avatar || contact.name?.charAt(0) || "U"}
        </div>
        {contact.online && (
          <div style={{
            position: "absolute", bottom: 1, right: 1,
            width: 10, height: 10, borderRadius: "50%",
            background: "#10b981", border: "2px solid var(--bg-secondary)"
          }} />
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {contact.name}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{contact.time}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
          <span style={{
            fontSize: 12, color: "var(--text-muted)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140
          }}>
            {contact.lastMessage}
          </span>
        </div>
        {/* Project tag */}
        {contact.projectTag && (
          <div style={{
            marginTop: 4,
            display: "inline-block", fontSize: 10, fontWeight: 600,
            padding: "1px 7px", borderRadius: 20,
            background: "rgba(99,102,241,0.1)", color: "var(--accent-purple)",
            maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {contact.projectTag}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg, myPubkey }) {
  const isMe = msg.from === "me" || msg.sender === myPubkey;
  const timeFormatted = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : msg.time || "Just now";

  return (
    <div style={{
      display: "flex", justifyContent: isMe ? "flex-end" : "flex-start",
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: "65%",
        background: isMe
          ? "linear-gradient(135deg,#6366f1,#4f46e5)"
          : "rgba(255,255,255,0.06)",
        border: isMe ? "none" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "10px 14px",
        color: "var(--text-primary)", fontSize: 14, lineHeight: 1.5,
        boxShadow: isMe ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
      }}>
        {msg.text || msg.encryptedContent}
        <div style={{
          fontSize: 10, color: isMe ? "rgba(255,255,255,0.6)" : "var(--text-muted)",
          textAlign: "right", marginTop: 4
        }}>
          {timeFormatted}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const [contacts, setContacts]             = useState([]);
  const [activeContact, setActiveContact]   = useState(null);
  const [messages, setMessages]             = useState([]);
  const [input, setInput]                   = useState("");
  const [search, setSearch]                 = useState("");
  const [loading, setLoading]               = useState(true);
  const [sending, setSending]               = useState(false);
  const messagesEndRef                      = useRef(null);

  const myPubkey = user?.walletAddress || user?.id || (publicKey ? publicKey.toBase58() : null);

  // 1. Fetch eligible contacts (users with shared proposals or contracts)
  useEffect(() => {
    async function loadContacts() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("ps_token");
        if (!myPubkey) {
          setContacts([]);
          setLoading(false);
          return;
        }
        const res = await api.getEligibleContacts(myPubkey, token);
        const list = Array.isArray(res) ? res : [];
        setContacts(list);
        if (list.length > 0) {
          setActiveContact(list[0]);
        }
      } catch (err) {
        console.error("Failed to load eligible contacts:", err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    }
    loadContacts();
  }, [myPubkey]);

  // 2. Fetch messages for active contact
  useEffect(() => {
    async function loadMessages() {
      if (!activeContact) {
        setMessages([]);
        return;
      }
      try {
        const token = sessionStorage.getItem("ps_token");
        const threadId = activeContact.threadId || [myPubkey, activeContact.publicKey || activeContact.id].sort().join("-");
        const res = await api.getThreadMessages(threadId, token);
        const list = Array.isArray(res) ? res : [];
        setMessages(list);
      } catch (err) {
        console.error("Failed to load thread messages:", err);
        setMessages([]);
      }
    }
    loadMessages();
  }, [activeContact, myPubkey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeContact || sending) return;
    const textToSend = input.trim();
    setInput("");
    setSending(true);

    const threadId = activeContact.threadId || [myPubkey, activeContact.publicKey || activeContact.id].sort().join("-");
    const optimisticMsg = {
      sender: myPubkey,
      encryptedContent: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const token = sessionStorage.getItem("ps_token");
      await api.sendDirectMessage(threadId, myPubkey, textToSend, token);
    } catch (err) {
      console.error("Failed to send message:", err);
      alert(err.message || "Failed to send message. Verified proposal or contract required.");
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.projectTag || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Messages</span>
            <span className="topbar-breadcrumb">Encrypted end-to-end chat</span>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div className="page-container" style={{ padding: 0, height: "calc(100vh - 68px)", display: "flex", gap: 0, overflow: "hidden" }}>
          {/* ── Left: Contact List ──────────────────────────────────────── */}
          <div style={{
            width: 300, flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.07)",
            display: "flex", flexDirection: "column",
            background: "rgba(255,255,255,0.015)",
            overflowY: "auto"
          }}>
            {/* Search */}
            <div style={{ padding: "16px 12px 8px", position: "sticky", top: 0, background: "var(--bg-secondary)", zIndex: 1 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  className="form-input"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 36, fontSize: 13, width: "100%", height: 38, background: "rgba(255,255,255,0.04)" }}
                />
              </div>
            </div>

            {/* E2E label */}
            <div style={{ padding: "6px 16px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <Lock size={10} style={{ color: "#10b981" }} />
              <span style={{ fontSize: 10, color: "#10b981", fontWeight: 600, letterSpacing: 0.5 }}>
                END-TO-END ENCRYPTED
              </span>
            </div>

            {/* Contacts */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
              {loading ? (
                <div style={{ padding: "30px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  Loading encrypted conversations...
                </div>
              ) : filteredContacts.length === 0 ? (
                <div style={{ padding: "30px 14px", textAlign: "center" }}>
                  <MessageSquare size={32} style={{ color: "var(--text-muted)", margin: "0 auto 10px", opacity: 0.7 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                    No Active Conversations
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    PayShield protects you: Messaging opens once a proposal is submitted or an escrow contract is created.
                  </p>
                </div>
              ) : (
                filteredContacts.map(c => (
                  <ContactItem
                    key={c.id}
                    contact={c}
                    isActive={activeContact?.id === c.id}
                    onClick={() => handleSelectContact(c)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Right: Chat Window ──────────────────────────────────────── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {activeContact ? (
              <>
                {/* Chat header */}
                <div style={{
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(255,255,255,0.01)",
                  flexShrink: 0
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "linear-gradient(135deg,#6366f1,#3b82f6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 15, color: "white"
                      }}>
                        {activeContact.avatar}
                      </div>
                      {activeContact.online && (
                        <div style={{
                          position: "absolute", bottom: 1, right: 1,
                          width: 9, height: 9, borderRadius: "50%",
                          background: "#10b981", border: "2px solid var(--bg-primary)"
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                        {activeContact.name}
                      </div>
                      <div style={{ fontSize: 12, color: activeContact.online ? "#10b981" : "var(--text-muted)" }}>
                        {activeContact.online ? "● Online" : "● Offline"} &nbsp;·&nbsp;
                        <span style={{ color: "var(--accent-purple)" }}>{activeContact.projectTag}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Lock size={13} style={{ color: "#10b981" }} />
                    <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>Encrypted</span>
                  </div>
                </div>

                {/* Messages */}
                <div style={{
                  flex: 1, overflowY: "auto", padding: "20px 24px",
                  display: "flex", flexDirection: "column"
                }}>
                  {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div style={{
                  padding: "12px 20px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.01)",
                  flexShrink: 0
                }}>
                  <button style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: "6px", borderRadius: 8,
                    transition: "color 0.2s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    className="form-input"
                    placeholder={`Message ${activeContact.name}...`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    style={{ flex: 1, fontSize: 14, height: 44, background: "rgba(255,255,255,0.05)" }}
                  />
                  <button style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: "6px", borderRadius: 8,
                    transition: "color 0.2s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                  >
                    <Smile size={18} />
                  </button>
                  <button
                    id="btn-chat-send"
                    className="btn btn-primary"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    style={{
                      width: 44, height: 44, padding: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 12, flexShrink: 0
                    }}
                  >
                    <Send size={17} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: 32, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <ShieldCheck size={32} style={{ color: "var(--accent-purple)" }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  End-to-End Encrypted Messaging
                </h3>
                <p style={{ fontSize: 13, maxWidth: 380, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                  Only clients and freelancers who share a submitted proposal or an active contract can message each other. Select a conversation on the left to view messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
