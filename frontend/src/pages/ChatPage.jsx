import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/common/NotificationBell";
import { Send, Search, Circle, Bot, Lock, Paperclip, Smile } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// ── Mock conversation data ──────────────────────────────────────────────────
const MOCK_CONTACTS = [
  {
    id: 1, name: "Alex Rivera", role: "client", avatar: "A",
    lastMessage: "Can you submit the milestone by Friday?",
    time: "10:32 AM", unread: 2, online: true,
    projectTag: "React Dashboard"
  },
  {
    id: 2, name: "Priya Shah", role: "client", avatar: "P",
    lastMessage: "Payment has been released on-chain ✅",
    time: "Yesterday", unread: 0, online: false,
    projectTag: "Smart Contract Dev"
  },
  {
    id: 3, name: "Marcus Chen", role: "freelancer", avatar: "M",
    lastMessage: "I'll review the deliverables today.",
    time: "Tuesday", unread: 0, online: true,
    projectTag: "UI/UX Design"
  },
  {
    id: 4, name: "Sofia Müller", role: "client", avatar: "S",
    lastMessage: "Great work on the API integration!",
    time: "Monday", unread: 1, online: false,
    projectTag: "MERN Stack App"
  },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, from: "them", text: "Hey! Just checking in on the dashboard progress.", time: "10:00 AM" },
    { id: 2, from: "me",   text: "Hi Alex! Going well. I've completed the charts and the stats panel. Working on the sidebar now.", time: "10:05 AM" },
    { id: 3, from: "them", text: "Perfect! Can you submit the milestone by Friday? The escrow will release on approval.", time: "10:20 AM" },
    { id: 4, from: "me",   text: "Absolutely. I'll have it ready by Thursday EOD for a buffer.", time: "10:25 AM" },
    { id: 5, from: "them", text: "Can you submit the milestone by Friday?", time: "10:32 AM" },
  ],
  2: [
    { id: 1, from: "them", text: "The smart contract audit came back clean.", time: "Yesterday 2:00 PM" },
    { id: 2, from: "me",   text: "Excellent! The gas optimization changes really helped.", time: "Yesterday 2:10 PM" },
    { id: 3, from: "them", text: "Payment has been released on-chain ✅", time: "Yesterday 3:00 PM" },
  ],
  3: [
    { id: 1, from: "me",   text: "I've shared the Figma design file in the IPFS link.", time: "Tue 11:00 AM" },
    { id: 2, from: "them", text: "Got it! Looks great. I'll review the deliverables today.", time: "Tue 11:30 AM" },
  ],
  4: [
    { id: 1, from: "them", text: "The API endpoints are working perfectly now.", time: "Mon 9:00 AM" },
    { id: 2, from: "me",   text: "Thanks! I added rate limiting and JWT refresh too.", time: "Mon 9:15 AM" },
    { id: 3, from: "them", text: "Great work on the API integration!", time: "Mon 10:00 AM" },
  ],
};

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
          {contact.avatar}
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
          {contact.unread > 0 && (
            <span style={{
              background: "#6366f1", color: "white",
              borderRadius: "50%", width: 18, height: 18,
              fontSize: 10, fontWeight: 700, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {contact.unread}
            </span>
          )}
        </div>
        {/* Project tag */}
        <div style={{
          marginTop: 4,
          display: "inline-block", fontSize: 10, fontWeight: 600,
          padding: "1px 7px", borderRadius: 20,
          background: "rgba(99,102,241,0.1)", color: "var(--accent-purple)"
        }}>
          {contact.projectTag}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isMe = msg.from === "me";
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
        {msg.text}
        <div style={{
          fontSize: 10, color: isMe ? "rgba(255,255,255,0.6)" : "var(--text-muted)",
          textAlign: "right", marginTop: 4
        }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth();
  const [activeContact, setActiveContact]   = useState(MOCK_CONTACTS[0]);
  const [messages, setMessages]             = useState(MOCK_MESSAGES[1]);
  const [input, setInput]                   = useState("");
  const [search, setSearch]                 = useState("");
  const [contacts, setContacts]             = useState(MOCK_CONTACTS);
  const messagesEndRef                      = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    setMessages(MOCK_MESSAGES[contact.id] || []);
    // Clear unread
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unread: 0 } : c));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(), from: "me", text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, newMsg]);
    // Update last message in contact list
    setContacts(prev => prev.map(c =>
      c.id === activeContact.id ? { ...c, lastMessage: input.trim(), time: "Just now" } : c
    ));
    setInput("");
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.projectTag.toLowerCase().includes(search.toLowerCase())
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
              {filteredContacts.map(c => (
                <ContactItem
                  key={c.id}
                  contact={c}
                  isActive={activeContact?.id === c.id}
                  onClick={() => handleSelectContact(c)}
                />
              ))}
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
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 15 }}>
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
