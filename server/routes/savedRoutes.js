const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { toggleSaveListing, getSavedListings } = require("../controllers/savedController");

router.use(protect, authorize("tenant"));

router.post("/toggle", toggleSaveListing);
router.get("/", getSavedListings);

module.exports = router;
