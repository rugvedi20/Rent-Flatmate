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
const validate = require("../middleware/validate");
const { createListingSchema, updateListingSchema, searchListingsQuerySchema } = require("../middleware/schemas");

router.use(protect);

router.get("/my", authorize("owner"), getMyListings);
router.get("/", authorize("tenant"), validate(searchListingsQuerySchema), searchListings);
router.get("/:id", getListingById);
router.post("/", authorize("owner"), validate(createListingSchema), createListing);
router.put("/:id", authorize("owner"), validate(updateListingSchema), updateListing);
router.put("/:id/fill", authorize("owner"), markFilled);
router.delete("/:id", authorize("owner"), deleteListing);

module.exports = router;
