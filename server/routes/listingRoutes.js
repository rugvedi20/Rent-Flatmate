const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createListing,
  updateListing,
  deleteListing,
  markFilled,
  getMyListings,
  searchListings,
  getListingById,
} = require("../controllers/listingController");

router.use(protect);

router.get("/my", authorize("owner"), getMyListings);
router.get("/", authorize("tenant"), searchListings);
router.get("/:id", getListingById);
router.post("/", authorize("owner"), createListing);
router.put("/:id", authorize("owner"), updateListing);
router.put("/:id/fill", authorize("owner"), markFilled);
router.delete("/:id", authorize("owner"), deleteListing);

module.exports = router;
