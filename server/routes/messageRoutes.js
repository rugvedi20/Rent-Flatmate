const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getMessages } = require("../controllers/messageController");

router.use(protect);
router.get("/:listingId", getMessages);

module.exports = router;
