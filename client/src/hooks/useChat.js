import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import chatService from "../services/chat.service";
import { storage } from "../utils";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export const useChat = (initialListingId = null, receiverId = null, user = null) => {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(async (selectLegacyId = null) => {
    if (!user) return;
    try {
      const data = await chatService.getConversations();
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
          try {
            await chatService.getMessagesByListing(selectLegacyId, receiverId);
            const refreshed = await chatService.getConversations();
            setConversations(refreshed);
            const match = refreshed.find(c => String(c.listingId?._id) === String(selectLegacyId));
            if (match) setActiveConvo(match);
          } catch {
            setError("Chat is not available for this listing yet.");
          }
        }
      } else if (data.length > 0 && !activeConvo) {
        setActiveConvo(data[0]);
      }
    } catch (err) {
      setError("Failed to load conversations");
    }
  }, [user, activeConvo, receiverId]);

  useEffect(() => {
    loadConversations(initialListingId);
  }, [initialListingId, loadConversations]);

  useEffect(() => {
    if (!activeConvo) return;

    setLoading(true);
    chatService.getConversationMessages(activeConvo._id, 50)
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load chat history");
        setLoading(false);
      });

    const socket = io(SOCKET_URL, { auth: { token: storage.getToken() } });
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

  const send = useCallback((e) => {
    e.preventDefault();
    if (!text.trim() || !activeConvo || !user) return;

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
  }, [text, activeConvo, user]);

  return {
    conversations,
    activeConvo,
    setActiveConvo,
    messages,
    text,
    setText,
    error,
    setError,
    loading,
    send,
    bottomRef,
  };
};

export default useChat;
