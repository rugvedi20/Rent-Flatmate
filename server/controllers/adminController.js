const User = require("../models/User");
const Listing = require("../models/Listing");
const Interest = require("../models/Interest");
const asyncHandler = require("../utils/asyncHandler");

// GET /admin/users - support keyword search
const getUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { role: new RegExp(search, "i") },
    ];
  }
  const users = await User.find(query).sort({ createdAt: -1 });
  res.json(users);
});

// DELETE /admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted successfully" });
});

// GET /admin/listings - support keyword search
const getListings = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
      { roomType: new RegExp(search, "i") },
      { furnishing: new RegExp(search, "i") },
    ];
  }
  const listings = await Listing.find(query).populate("ownerId", "name email").sort({ createdAt: -1 });
  res.json(listings);
});

// DELETE /admin/listings/:id
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }
  await listing.deleteOne();
  res.json({ success: true, message: "Listing deleted successfully" });
});

// GET /admin/stats - платформы stats and recent activities
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOwners,
    totalTenants,
    totalListings,
    activeListings,
    totalInterests,
    acceptedInterests,
    recentUsers,
    recentListings,
    recentInterests,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "owner" }),
    User.countDocuments({ role: "tenant" }),
    Listing.countDocuments(),
    Listing.countDocuments({ status: "available" }),
    Interest.countDocuments(),
    Interest.countDocuments({ status: "accepted" }),
    User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
    Listing.find().sort({ createdAt: -1 }).limit(5).populate("ownerId", "name").select("title location rent createdAt"),
    Interest.find().sort({ createdAt: -1 }).limit(5).populate("tenantId", "name").populate("listingId", "title").select("status createdAt"),
  ]);

  res.json({
    totalUsers,
    totalOwners,
    totalTenants,
    totalListings,
    activeListings,
    totalInterests,
    acceptedInterests,
    recentActivity: {
      users: recentUsers,
      listings: recentListings,
      interests: recentInterests,
    },
  });
});

module.exports = { getUsers, deleteUser, getListings, deleteListing, getStats };
