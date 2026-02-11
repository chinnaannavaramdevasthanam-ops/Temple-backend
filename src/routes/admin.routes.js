const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
  dashboardStats,
  recentActivity,
  getAllBookings,
  getAllDonations,
  updateDonationStatus,
  getAllSevasAdmin,
  deactivateSeva,
  activateSeva
} = require("../controllers/admin.controller");

// DASHBOARD
router.get("/stats", auth, admin, dashboardStats);
router.get("/recent", auth, admin, recentActivity);

// SEVAS (ADMIN)
router.get("/sevas", auth, admin, getAllSevasAdmin);
router.patch("/sevas/:id/deactivate", auth, admin, deactivateSeva);
router.patch("/sevas/:id/activate", auth, admin, activateSeva);

// BOOKINGS (ADMIN)
router.get("/bookings", auth, admin, getAllBookings);

// DONATIONS (ADMIN)
router.get("/donations", auth, admin, getAllDonations);
router.patch("/donations/:id", auth, admin, updateDonationStatus);

module.exports = router;
