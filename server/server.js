require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const registerChatHandlers = require("./sockets/chatSocket");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const interestRoutes = require("./routes/interestRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const savedRoutes = require("./routes/savedRoutes");
const profileRoutes = require("./routes/profileRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

connectDB();

const app = express();

// ---------------------------------------------------------------------------
// CORS — supports multiple origins supplied as a comma-separated CLIENT_URL
// env var, e.g.: CLIENT_URL=http://localhost:5173,https://my-app.vercel.app
// ---------------------------------------------------------------------------
const rawOrigins = process.env.CLIENT_URL || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

/**
 * Dynamic origin validator used by both Express CORS middleware and Socket.IO.
 * Allows any origin when no CLIENT_URL is configured (local dev convenience).
 */
const originValidator = (origin, callback) => {
  // Requests with no Origin header (e.g. curl, Postman, server-to-server)
  if (!origin) return callback(null, true);
  if (allowedOrigins.length === 0) return callback(null, true); // no restriction
  if (allowedOrigins.includes(origin)) return callback(null, true);
  callback(new Error(`CORS: origin '${origin}' is not allowed`));
};

const corsOptions = {
  origin: originValidator,
  credentials: true, // allow Authorization / Cookie headers cross-origin
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Security Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // pre-flight for all routes
app.use(express.json());

// Request logging
app.use(morgan("dev", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Auth-only rate limiter — applied exclusively to /api/auth to prevent
// brute-force attacks on login/register without throttling normal API usage.
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1-hour sliding window
  max: 30,                   // 30 auth attempts per IP per hour
  standardHeaders: true,     // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,      // Suppress deprecated X-RateLimit-* headers
  skipSuccessfulRequests: true, // Only count failed/errored attempts
  message: {
    success: false,
    message: "Too many login attempts from this IP. Please try again in an hour.",
  },
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/interest", interestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reviews", reviewRoutes);

// Centralized error handler
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions, // shared validator — same allowed origins as Express
});

registerChatHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
