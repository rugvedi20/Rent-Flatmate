const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createInterest,
  updateInterestStatus,
  getReceivedInterests,
  getSentInterests,
} = require("../controllers/interestController");

router.use(protect);

router.post("/", authorize("tenant"), createInterest);
router.put("/:id", authorize("owner"), updateInterestStatus);
router.get("/received", authorize("owner"), getReceivedInterests);
router.get("/sent", authorize("tenant"), getSentInterests);

module.exports = router;
