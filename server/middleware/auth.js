const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies JWT and attaches req.user
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found or inactive" });
    }

    req.user = user; // full user doc (minus password)
    next();
  } catch (err) {
    let message = "Not authorized, invalid or expired token";
    if (err.name === "TokenExpiredError") {
      message = "Token expired, please log in again";
    }
    return res.status(401).json({ success: false, message });
  }
};

// Restricts access to specific roles, e.g. authorize("owner", "admin")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${req.user?.role || "unknown"}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
