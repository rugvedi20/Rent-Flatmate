const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { createReview, getReviewsForOwner } = require("../controllers/reviewController");

router.use(protect);

router.post("/", createReview);
router.get("/owner/:ownerId", getReviewsForOwner);

module.exports = router;
