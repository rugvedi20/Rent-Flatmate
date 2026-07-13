const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Listing = require("../models/Listing");
const Interest = require("../models/Interest");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Asserts that a user has chat access permission.
 * Left in for backwards compatibility.
 */
async function assertChatAccess(userId, listingId, tenantId) {
  const listing = await Listing.findById(listingId);
  if (!listing) throw { status: 404, message: "Listing not found" };

  const isOwner = String(listing.ownerId) === String(userId);
  const targetTenantId = isOwner ? tenantId : userId;
  const targetOwnerId = isOwner ? userId : listing.ownerId;

  if (!targetTenantId) {
    throw { status: 400, message: "Tenant reference required for authorization" };
  }

  const acceptedInterest = await Interest.findOne({
    listingId,
    status: "accepted",
    tenantId: targetTenantId,
    ownerId: targetOwnerId,
  });

  if (!acceptedInterest) {
    throw { status: 403, message: "Chat is only available after an interest request has been accepted" };
  }

  return acceptedInterest;
}

/**
 * GET /messages/conversations - Returns list of conversations for current user.
 */
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    $or: [{ tenantId: userId }, { ownerId: userId }],
  })
    .populate("listingId", "title location rent photos status")
    .populate("tenantId", "name email role")
    .populate("ownerId", "name email role")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.json(conversations);
});

/**
 * GET /messages/conversation/:conversationId - Returns messages inside conversation thread with page-based pagination.
 */
const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user._id;

  const convo = await Conversation.findById(conversationId);
  if (!convo) {
    return res.status(404).json({ success: false, message: "Conversation thread not found" });
  }

  if (String(convo.tenantId) !== String(userId) && String(convo.ownerId) !== String(userId)) {
    return res.status(403).json({ success: false, message: "Access to this conversation is denied" });
  }

  const total = await Message.countDocuments({ conversationId });
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  // Reverse to maintain chronological order in UI rendering
  messages.reverse();

  // Mark unread incoming messages as read
  await Message.updateMany(
    { conversationId, receiver: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  res.json({
    messages,
    pagination: {
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

/**
 * GET /messages/:listingId - Backward compatibility endpoint.
 * Fetches the conversation thread based on listing coordinates and user context.
 */
const getMessages = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const userId = req.user._id;
  const isOwner = req.user.role === "owner";

  let tenantId;
  let ownerId;

  if (isOwner) {
    tenantId = req.query.receiverId;
    ownerId = userId;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: "receiverId query parameter is required for owners" });
    }
  } else {
    tenantId = userId;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    ownerId = listing.ownerId;
  }

  const convo = await Conversation.findOne({ listingId, tenantId, ownerId });
  if (!convo) {
    return res.status(403).json({
      success: false,
      message: "Chat is only available after an interest request has been accepted",
    });
  }

  // Mark unread messages as read
  await Message.updateMany(
    { conversationId: convo._id, receiver: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  const messages = await Message.find({ conversationId: convo._id }).sort({ createdAt: 1 });
  res.json(messages);
});

module.exports = {
  getConversations,
  getConversationMessages,
  getMessages,
  assertChatAccess,
};
