const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { upsertProfile, getProfile } = require("../controllers/tenantController");

router.use(protect, authorize("tenant"));

router.post("/profile", upsertProfile);
router.get("/profile", getProfile);

module.exports = router;
