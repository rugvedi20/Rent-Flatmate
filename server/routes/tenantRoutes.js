const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { upsertProfile, getProfile } = require("../controllers/tenantController");
const validate = require("../middleware/validate");
const { upsertProfileSchema } = require("../middleware/schemas");

router.use(protect, authorize("tenant"));

router.post("/profile", validate(upsertProfileSchema), upsertProfile);
router.get("/profile", getProfile);

module.exports = router;
