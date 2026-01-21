const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const {
  createDonation,
  myDonations,
  getAllDonations,
  updateDonationStatus
} = require("../controllers/donation.controller");

// USER
router.post("/", auth, createDonation);
router.get("/my", auth, myDonations);

// ADMIN
router.get("/all", auth, admin, getAllDonations);
router.patch("/:id/status", auth, admin, updateDonationStatus);

module.exports = router;
