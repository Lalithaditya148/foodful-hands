require("dotenv").config({ path: require("path").join(__dirname, ".env") });
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

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
function isAllowedOrigin(origin) {
  if (!origin) return true;
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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
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
  // Clients join a room for donations they care about
  socket.on("watch:donation", (donationId) => {
    if (typeof donationId === "string") socket.join(`donation:${donationId}`);
  });
  // Clients can join a room for all donations (used for the list view)
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
}

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use(errorMiddleware);

const port = process.env.PORT || 5000;
connectDB()
  .then(() => {
    httpServer.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));

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
    console.error("Unable to start backend", error);
    process.exit(1);
  });
