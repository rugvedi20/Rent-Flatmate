const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getProfileByUserId, upsertProfile } = require("../controllers/profileController");

router.use(protect);

router.get("/:userId", getProfileByUserId);
router.post("/", upsertProfile);

module.exports = router;
