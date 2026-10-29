require("dotenv").config({ path: require("path").join(__dirname, ".env") });

console.log("==========================================");
console.log("Server starting...");
console.log("PORT:", process.env.PORT || 5000);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URI defined:", Boolean(process.env.MONGO_URI));
console.log("SESSION_SECRET defined:", Boolean(process.env.SESSION_SECRET));
console.log("==========================================");

const express = require("express");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const { Server: SocketIO } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const donationRoutes = require("./routes/donationRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
const httpServer = http.createServer(app);

app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts, please try again later" },
});

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const clientUrl = process.env.CLIENT_URL || "*";
  if (clientUrl === "*") return true;
  const allowedOrigins = clientUrl.split(",").map((o) => o.trim()).filter(Boolean);
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== "production") {
    try {
      const url = new URL(origin);
      return (
        url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")
      );
    } catch {
      return false;
    }
  }
  return false;
}
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

const mongoUrl = process.env.MONGO_URI;
if (!mongoUrl) {
  console.error("FATAL: MONGO_URI environment variable is missing!");
  process.exit(1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret_dont_use_in_prod",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl,
      mongoOptions: {
        serverSelectionTimeoutMS: 10000,
        authSource: "admin",
      },
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

// Socket.IO setup for live tracking
const io = new SocketIO(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  },
});
app.locals.io = io;

io.on("connection", (socket) => {
  socket.on("watch:donation", (donationId) => {
    if (typeof donationId === "string") socket.join(`donation:${donationId}`);
  });
  socket.on("watch:donations", () => {
    socket.join("donations:all");
  });
});

app.get("/api/health", (_req, res) => res.json({ success: true, message: "API is healthy" }));
app.get("/health", (_req, res) => res.json({ success: true, message: "API is healthy" }));

// Support both /api/* and /* routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/contact", contactRoutes);
app.use("/api/donations", donationRoutes);
app.use("/donations", donationRoutes);

// Serve compiled frontend in production if dist exists
const path = require("path");
const fs = require("fs");
const clientDistPath = path.resolve(__dirname, "../dist");
const localDistPath = path.resolve(__dirname, "./dist");
const outputPublicPath = path.resolve(__dirname, "../.output/public");
const distDir = fs.existsSync(clientDistPath)
  ? clientDistPath
  : fs.existsSync(localDistPath)
    ? localDistPath
    : fs.existsSync(outputPublicPath)
      ? outputPublicPath
      : null;

// One-click seed endpoint for initial setup
app.get("/api/seed", async (_req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const User = require("./models/User");
    const Donation = require("./models/Donation");
    const ContactMessage = require("./models/ContactMessage");

    const usersToSeed = [
      {
        name: "Platform Admin",
        email: "admin@smartfoodhub.org",
        phone: "+91 98765 43210",
        city: "Vijayawada",
        address: "Benz Circle, Vijayawada",
        password: "admin123",
        role: "admin",
      },
      {
        name: "Ravi Kumar (Donor)",
        email: "donor@demo.com",
        phone: "+91 90000 11111",
        city: "Vijayawada",
        address: "Gandhi Nagar, Vijayawada",
        password: "donor123",
        role: "donor",
      },
      {
        name: "Sunrise Orphanage",
        managerName: "Sister Mary",
        orgType: "orphanage",
        email: "org@demo.com",
        phone: "+91 90000 22222",
        city: "Vijayawada",
        address: "Patamata, Vijayawada",
        password: "org123",
        role: "organization",
        orgStatus: "approved",
      },
      {
        name: "Hope Elders Care Home",
        managerName: "Lakshmi Prasad",
        orgType: "old_age_home",
        email: "hope@demo.com",
        phone: "+91 90000 33333",
        city: "Vijayawada",
        address: "Bhavanipuram, Vijayawada",
        password: "org123",
        role: "organization",
        orgStatus: "pending",
      },
    ];

    const seededUsers = [];
    for (const u of usersToSeed) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create({ ...u, password: await bcrypt.hash(u.password, 12) });
      }
      seededUsers.push(existing.email);
    }

    // Seed sample donations if none exist
    const donationCount = await Donation.countDocuments();
    if (donationCount === 0) {
      const donor = await User.findOne({ email: "donor@demo.com" });
      const org = await User.findOne({ email: "org@demo.com" });
      const now = Date.now();
      await Donation.insertMany([
        {
          donor: donor._id,
          donorName: donor.name,
          donorPhone: donor.phone,
          eventType: "Marriage",
          foodType: "Veg",
          foodName: "Hyderabadi Veg Biryani & Salan",
          quantity: 50,
          originalQuantity: 50,
          preparedAt: new Date(now - 3600000),
          availableUntil: new Date(now + 14400000),
          pickupAddress: "Subham Kalyana Mandapam, MG Road",
          city: "Vijayawada",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=MG+Road+Vijayawada",
          imageUrl:
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
          safetyConfirmed: true,
          status: "available",
        },
        {
          donor: donor._id,
          organization: org._id,
          donorName: donor.name,
          donorPhone: donor.phone,
          eventType: "Function",
          foodType: "Veg",
          foodName: "South Indian Thali (Rice, Sambar, Poriyal)",
          quantity: 40,
          originalQuantity: 60,
          claimedQuantity: 40,
          preparedAt: new Date(now - 3600000),
          availableUntil: new Date(now + 10800000),
          pickupAddress: "Sita Kalyana Vedika, Governorpet",
          city: "Vijayawada",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=Governorpet+Vijayawada",
          imageUrl:
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
          safetyConfirmed: true,
          status: "claimed",
        },
      ]);
    }

    res.json({
      success: true,
      message: "Database seeded successfully!",
      users: seededUsers,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

if (distDir) {
  app.use(express.static(distDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(distDir, "index.html"));
  });
} else {
  // If no dist folder built yet, provide a friendly status page at root
  app.get("/", (_req, res) => {
    res.json({
      service: "Smart Food Distribution API",
      status: "online",
      health: "/api/health",
      documentation: "Deploy frontend separately or run full build",
    });
  });
}

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use(errorMiddleware);

const port = process.env.PORT || 5000;
console.log("Connecting to database...");
connectDB()
  .then(() => {
    console.log("Database connected successfully! Starting HTTP server...");
    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server successfully listening on 0.0.0.0:${port}`);
    });

    function gracefulShutdown() {
      console.log("Shutting down gracefully...");
      io.close();
      httpServer.close(() => {
        console.log("Server closed.");
        mongoose.connection.close(false).then(() => {
          console.log("Mongo connection closed.");
          process.exit(0);
        });
      });
    }

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  })
  .catch((error) => {
    console.error("FATAL: Unable to start backend:", error);
    process.exit(1);
  });
