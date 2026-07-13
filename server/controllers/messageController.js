const Message = require("../models/Message");
const Interest = require("../models/Interest");
const Listing = require("../models/Listing");

/**
 * Confirms the requesting user is either the tenant or owner on an ACCEPTED
 * interest for this listing. Chat is only allowed after acceptance so owners
 * aren't spammed by every tenant who views a listing.
 */
async function assertChatAccess(userId, listingId) {
  const listing = await Listing.findById(listingId);
  if (!listing) throw { status: 404, message: "Listing not found" };

  const isOwner = String(listing.ownerId) === String(userId);

  const acceptedInterest = await Interest.findOne({
    listingId,
    status: "accepted",
    ...(isOwner ? { ownerId: userId } : { tenantId: userId }),
  });

  if (!acceptedInterest) {
    throw { status: 403, message: "Chat is only available after an interest request has been accepted" };
  }

  return acceptedInterest;
}

// GET /messages/:listingId - chat history for a listing (tenant or owner side)
async function getMessages(req, res) {
  try {
    const { listingId } = req.params;
    await assertChatAccess(req.user._id, listingId);

    const messages = await Message.find({ listingId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to fetch messages" });
  }
}

module.exports = { getMessages, assertChatAccess };
