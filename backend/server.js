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

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/donations", donationRoutes);

// Serve compiled frontend in production if dist exists
const path = require("path");
const fs = require("fs");
const clientDistPath = path.resolve(__dirname, "../dist");
const localDistPath = path.resolve(__dirname, "./dist");
const distDir = fs.existsSync(clientDistPath)
  ? clientDistPath
  : fs.existsSync(localDistPath)
    ? localDistPath
    : null;

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
