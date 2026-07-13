const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createInterest,
  updateInterestStatus,
  getReceivedInterests,
  getSentInterests,
} = require("../controllers/interestController");
const validate = require("../middleware/validate");
const { createInterestSchema, updateInterestSchema } = require("../middleware/schemas");

router.use(protect);

router.post("/", authorize("tenant"), validate(createInterestSchema), createInterest);
router.put("/:id", authorize("owner"), validate(updateInterestSchema), updateInterestStatus);
router.get("/received", authorize("owner"), getReceivedInterests);
router.get("/sent", authorize("tenant"), getSentInterests);

module.exports = router;
