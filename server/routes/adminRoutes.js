const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getUsers,
  deleteUser,
  getListings,
  deleteListing,
  getStats,
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.get("/listings", getListings);
router.delete("/listings/:id", deleteListing);
router.get("/stats", getStats);

module.exports = router;
