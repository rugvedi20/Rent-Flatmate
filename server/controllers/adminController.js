const User = require("../models/User");
const Listing = require("../models/Listing");
const Interest = require("../models/Interest");

// GET /admin/users
async function getUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
}

// DELETE /admin/users/:id
async function deleteUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  await user.deleteOne();
  res.json({ message: "User deleted" });
}

// GET /admin/listings
async function getListings(req, res) {
  const listings = await Listing.find().populate("ownerId", "name email").sort({ createdAt: -1 });
  res.json(listings);
}

// DELETE /admin/listings/:id
async function deleteListing(req, res) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: "Listing not found" });
  await listing.deleteOne();
  res.json({ message: "Listing deleted" });
}

// GET /admin/stats - basic platform activity overview
async function getStats(req, res) {
  const [totalUsers, totalOwners, totalTenants, totalListings, activeListings, totalInterests, acceptedInterests] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "tenant" }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: "available" }),
      Interest.countDocuments(),
      Interest.countDocuments({ status: "accepted" }),
    ]);

  res.json({
    totalUsers,
    totalOwners,
    totalTenants,
    totalListings,
    activeListings,
    totalInterests,
    acceptedInterests,
  });
}

module.exports = { getUsers, deleteUser, getListings, deleteListing, getStats };
