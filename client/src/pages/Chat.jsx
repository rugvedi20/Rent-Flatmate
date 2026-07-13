import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function Chat() {
  const { listingId } = useParams();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("receiverId");
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const loadConversations = async (selectLegacyId = null) => {
    try {
      const { data } = await api.get("/messages/conversations");
      setConversations(data);

      if (selectLegacyId && selectLegacyId !== "active" && selectLegacyId.match(/^[0-9a-fA-F]{24}$/)) {
        const found = data.find(
          (c) =>
            String(c.listingId?._id) === String(selectLegacyId) &&
            (String(c.tenantId?._id) === String(user._id) || String(c.ownerId?._id) === String(user._id))
        );
        if (found) {
          setActiveConvo(found);
        } else {
          api.get(`/messages/${selectLegacyId}?receiverId=${receiverId}`)
            .then(async () => {
              const refreshed = await api.get("/messages/conversations");
              setConversations(refreshed.data);
              const match = refreshed.data.find(c => String(c.listingId?._id) === String(selectLegacyId));
              if (match) setActiveConvo(match);
            })
            .catch(() => setError("Chat is not available for this listing yet."));
        }
      } else if (data.length > 0 && !activeConvo) {
        setActiveConvo(data[0]);
      }
    } catch (err) {
      setError("Failed to load conversations");
    }
  };

  useEffect(() => {
    loadConversations(listingId);
  }, [listingId]);

  useEffect(() => {
    if (!activeConvo) return;

    setLoading(true);
    api.get(`/messages/conversation/${activeConvo._id}?limit=50`)
      .then(({ data }) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load chat history");
        setLoading(false);
      });

    const socket = io(SOCKET_URL, { auth: { token: localStorage.getItem("token") } });
    socketRef.current = socket;

    socket.emit("join_chat", { conversationId: activeConvo._id }, (res) => {
      if (!res.ok) setError(res.message);
    });

    socket.on("receive_message", (msg) => {
      if (String(msg.conversationId) === String(activeConvo._id)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeConvo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConvo) return;

    const recipient = String(activeConvo.tenantId?._id) === String(user._id)
      ? activeConvo.ownerId?._id
      : activeConvo.tenantId?._id;

    socketRef.current.emit(
      "send_message",
      {
        conversationId: activeConvo._id,
        receiverId: recipient,
        message: text,
      },
      (res) => {
        if (!res.ok) {
          setError(res.message);
        } else {
          setConversations((prev) =>
            prev.map((c) =>
              String(c._id) === String(activeConvo._id) ? { ...c, lastMessage: res.message } : c
            )
          );
        }
      }
    );
    setText("");
  };

  return (
    <div className="container" style={{ maxWidth: "1150px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", letterSpacing: "-0.02em" }}>Messages</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Connect directly with room owners and matched flatmates.</p>
      </div>

      {error && (
        <div style={{ color: "var(--danger)", background: "var(--danger-light)", padding: "12px 18px", borderRadius: "12px", marginBottom: "20px", fontWeight: "600", fontSize: "14px" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="chat-layout">
        {/* Conversations Sidebar */}
        <div className="chat-sidebar">
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "white", fontWeight: "700", fontSize: "16px" }}>
            Inbox Threads
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {conversations.length === 0 && (
              <p style={{ padding: "40px 24px", color: "var(--text-muted)", fontSize: "13.5px", textAlign: "center" }}>
                No active chat threads yet. Express or accept interest to unlock chat rooms.
              </p>
            )}
            {conversations.map((c) => {
              const partner = String(c.tenantId?._id) === String(user._id) ? c.ownerId : c.tenantId;
              const isActive = activeConvo && String(c._id) === String(activeConvo._id);
              return (
                <div
                  key={c._id}
                  className={`convo-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveConvo(c)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14.5px" }}>
                      {partner?.name || "Flatmate Match"}
                    </span>
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: "500" }}>
                      {c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600", marginBottom: "6px" }}>
                    🏢 {c.listingId?.title || "Listing Address"}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.lastMessage ? c.lastMessage.message : "No messages exchanged yet."}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Messaging Content Grid */}
        <div className="chat-area">
          {activeConvo ? (
            <>
              <div className="chat-header">
                <div>
                  <span style={{ fontWeight: "700", fontSize: "16.5px", color: "var(--text-main)" }}>
                    {String(activeConvo.tenantId?._id) === String(user._id) ? activeConvo.ownerId?.name : activeConvo.tenantId?.name}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "8px" }}>
                    · {activeConvo.listingId?.title}
                  </span>
                </div>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }}></span>
              </div>

              <div className="chat-messages">
                {loading && <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>Loading logs...</p>}
                {messages.map((m) => {
                  const isMine = String(m.sender) === String(user._id);
                  return (
                    <div key={m._id} className={`msg-wrapper ${isMine ? "mine" : "theirs"}`}>
                      <div className="msg-bubble">
                        {m.message}
                      </div>
                      <div className="msg-meta">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {m.readAt && isMine && <span style={{ marginLeft: "6px", color: "var(--primary)" }}>✓ Read</span>}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="chat-input-bar">
                <input
                  style={{ flex: 1, padding: "14px 20px" }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your message here..."
                />
                <button type="submit" style={{ padding: "12px 28px" }}>Send</button>
              </form>
            </>
          ) : (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "48px" }}>💬</span>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Your Chat Inbox</h3>
              <p style={{ fontSize: "14px", margin: 0 }}>Select a thread from the list to start conversing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
