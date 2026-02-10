const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const adminController = require("../controllers/admin.controller");

// DASHBOARD
router.get("/stats", auth, admin, adminController.dashboardStats);
router.get("/recent", auth, admin, adminController.recentActivity);

// SEVAS
router.get("/sevas", auth, admin, adminController.getAllSevasAdmin);
router.patch("/sevas/:id/deactivate", auth, admin, adminController.deactivateSeva);
router.patch("/sevas/:id/activate", auth, admin, adminController.activateSeva);

// BOOKINGS
router.get("/bookings", auth, admin, adminController.getAllBookings);

// DONATIONS
router.get("/donations", auth, admin, adminController.getAllDonations);
router.patch("/donations/:id", auth, admin, adminController.updateDonationStatus);

module.exports = router;
