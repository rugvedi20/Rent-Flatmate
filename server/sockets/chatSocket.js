const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const logger = require("../utils/logger");

/**
 * Socket.IO auth middleware verification.
 */
async function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication token missing"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return next(new Error("Invalid user"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
}

/**
 * Attaches message channel listening handshakes.
 */
function registerChatHandlers(io) {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.user.email} (${socket.id})`);

    socket.on("join_chat", async ({ conversationId, listingId, receiverId }, callback) => {
      try {
        let convo;
        if (conversationId) {
          convo = await Conversation.findById(conversationId);
        } else if (listingId && receiverId) {
          const tenantId = socket.user.role === "tenant" ? socket.user._id : receiverId;
          const ownerId = socket.user.role === "owner" ? socket.user._id : receiverId;
          convo = await Conversation.findOne({ listingId, tenantId, ownerId });
        }

        if (!convo) {
          return callback?.({ ok: false, message: "Chat conversation not found or access forbidden" });
        }

        if (String(convo.tenantId) !== String(socket.user._id) && String(convo.ownerId) !== String(socket.user._id)) {
          return callback?.({ ok: false, message: "Access denied" });
        }

        socket.join(`conversation:${convo._id}`);
        socket.join(`listing:${convo.listingId}:tenant:${convo.tenantId}`);

        callback?.({ ok: true, conversationId: convo._id });
      } catch (err) {
        callback?.({ ok: false, message: err.message || "Failed to join room" });
      }
    });

    socket.on("send_message", async ({ conversationId, listingId, receiverId, message }, callback) => {
      try {
        let convo;
        if (conversationId) {
          convo = await Conversation.findById(conversationId);
        } else if (listingId && receiverId) {
          const tenantId = socket.user.role === "tenant" ? socket.user._id : receiverId;
          const ownerId = socket.user.role === "owner" ? socket.user._id : receiverId;
          convo = await Conversation.findOne({ listingId, tenantId, ownerId });
        }

        if (!convo) {
          return callback?.({ ok: false, message: "Conversation not found" });
        }

        const isTenant = String(convo.tenantId) === String(socket.user._id);
        const isOwner = String(convo.ownerId) === String(socket.user._id);
        if (!isTenant && !isOwner) {
          return callback?.({ ok: false, message: "Access denied" });
        }

        const resolvedReceiverId = isTenant ? convo.ownerId : convo.tenantId;

        const saved = await Message.create({
          conversationId: convo._id,
          listingId: convo.listingId,
          sender: socket.user._id,
          receiver: resolvedReceiverId,
          message,
        });

        // Update conversation summary field
        await Conversation.findByIdAndUpdate(convo._id, { lastMessage: saved._id });

        io.to(`conversation:${convo._id}`).emit("receive_message", saved);
        io.to(`listing:${convo.listingId}:tenant:${convo.tenantId}`).emit("receive_message", saved);

        callback?.({ ok: true, message: saved });
      } catch (err) {
        callback?.({ ok: false, message: err.message || "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.user.email} (${socket.id})`);
    });
  });
}

module.exports = registerChatHandlers;
