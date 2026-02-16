const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const adminController = require("../controllers/admin.controller");

// Destructure safely
const {
  dashboardStats,
  recentActivity,
  getAllBookings,
  getAllDonations,
  updateDonationStatus,
  getAllSevasAdmin,
  deactivateSeva,
  activateSeva
} = adminController;

/* ===========================
   SAFETY CHECK (prevents crash)
=========================== */
const ensureFn = (fn, name) => {
  if (typeof fn !== "function") {
    throw new Error(`Admin route handler "${name}" is not defined or not exported`);
  }
  return fn;
};

/* ===========================
   DASHBOARD
=========================== */
router.get("/stats", auth, admin, ensureFn(dashboardStats, "dashboardStats"));
router.get("/recent", auth, admin, ensureFn(recentActivity, "recentActivity"));

/* ===========================
   SEVAS
=========================== */
router.get("/sevas", auth, admin, ensureFn(getAllSevasAdmin, "getAllSevasAdmin"));
router.patch("/sevas/:id/deactivate", auth, admin, ensureFn(deactivateSeva, "deactivateSeva"));
router.patch("/sevas/:id/activate", auth, admin, ensureFn(activateSeva, "activateSeva"));

/* ===========================
   BOOKINGS
=========================== */
router.get("/bookings", auth, admin, ensureFn(getAllBookings, "getAllBookings"));

/* ===========================
   DONATIONS
=========================== */
router.get("/donations", auth, admin, ensureFn(getAllDonations, "getAllDonations"));
router.patch("/donations/:id", auth, admin, ensureFn(updateDonationStatus, "updateDonationStatus"));

module.exports = router;
