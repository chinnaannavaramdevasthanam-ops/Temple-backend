const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const auth = require("./middleware/auth.middleware");
const sevaRoutes = require("./routes/seva.routes");
const bookingRoutes = require("./routes/booking.routes");
const donationRoutes = require("./routes/donation.routes");
const adminRoutes = require("./routes/admin.routes");
const galleryRoutes = require("./routes/gallery.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();   // ✅ CREATE APP FIRST

/* ================= MIDDLEWARE ================= */

app.use(morgan("dev"));
app.use(helmet());
app.disable("x-powered-by");

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

/* ================= ROUTES ================= */

app.get("/api/test", auth, (req, res) => {
  res.json({ message: "Protected", user: req.user });
});

app.use("/api/auth", authRoutes);
app.use("/api/sevas", sevaRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gallery", galleryRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.send("Temple Backend Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime()
  });
});



app.use(errorHandler);

module.exports = app;
