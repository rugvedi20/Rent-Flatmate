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
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Load persisted history first
    api.get(`/messages/${listingId}`)
      .then(({ data }) => setMessages(data))
      .catch((err) => setError(err.response?.data?.message || "Cannot load chat"));

    const socket = io(SOCKET_URL, { auth: { token: localStorage.getItem("token") } });
    socketRef.current = socket;

    socket.emit("join_chat", { listingId }, (res) => {
      if (!res.ok) setError(res.message);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [listingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current.emit(
      "send_message",
      { listingId, receiverId, message: text },
      (res) => {
        if (!res.ok) setError(res.message);
      }
    );
    setText("");
  };

  return (
    <div className="container">
      <h2>Chat</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="chat-window">
        {messages.map((m) => (
          <div key={m._id} className={`msg ${String(m.sender) === String(user._id) ? "msg-mine" : "msg-theirs"}`}>
            {m.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ flexDirection: "row", marginTop: 10 }}>
        <input style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
