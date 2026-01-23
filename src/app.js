const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const auth = require("./middleware/auth.middleware");
const sevaRoutes = require("./routes/seva.routes");
const bookingRoutes = require("./routes/booking.routes");
const donationRoutes = require("./routes/donation.routes");
const adminRoutes = require("./routes/admin.routes");
const galleryRoutes = require("./routes/gallery.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/test", auth, (req, res) => {
  res.json({ message: "Protected", user: req.user });
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/sevas", sevaRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/donations", donationRoutes);  
app.use("/api/admin", adminRoutes);

app.use("/api/gallery", galleryRoutes);
  


app.get("/", (req, res) => {
  res.send("Temple Backend Running");
});

module.exports = app;
