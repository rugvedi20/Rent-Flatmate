const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const { assertChatAccess } = require("../controllers/messageController");

/**
 * Socket.IO auth middleware: expects a JWT in the handshake auth payload,
 * e.g. io(url, { auth: { token: "<jwt>" } }) on the client.
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

function registerChatHandlers(io) {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    // Client joins a room scoped to a specific listing's conversation
    socket.on("join_chat", async ({ listingId }, callback) => {
      try {
        await assertChatAccess(socket.user._id, listingId);
        socket.join(`listing:${listingId}`);
        callback?.({ ok: true });
      } catch (err) {
        callback?.({ ok: false, message: err.message || "Access denied" });
      }
    });

    // Client sends a message; persisted to DB then broadcast to the room
    socket.on("send_message", async ({ listingId, receiverId, message }, callback) => {
      try {
        await assertChatAccess(socket.user._id, listingId);

        const saved = await Message.create({
          listingId,
          sender: socket.user._id,
          receiver: receiverId,
          message,
        });

        io.to(`listing:${listingId}`).emit("receive_message", saved);
        callback?.({ ok: true, message: saved });
      } catch (err) {
        callback?.({ ok: false, message: err.message || "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      // No-op: rooms are cleaned up automatically by Socket.IO
    });
  });
}

module.exports = registerChatHandlers;
