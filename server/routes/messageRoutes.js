const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getConversations,
  getConversationMessages,
  getMessages,
} = require("../controllers/messageController");

router.use(protect);

// Main conversation endpoints (defined first so listingId slug doesn't intercept them)
router.get("/conversations", getConversations);
router.get("/conversation/:conversationId", getConversationMessages);

// Legacy/backward compatibility endpoint
router.get("/:listingId", getMessages);

module.exports = router;
