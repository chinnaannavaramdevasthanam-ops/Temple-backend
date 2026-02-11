const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
  bookSeva,
  myBookings,
  allBookings
} = require("../controllers/booking.controller");

// USER
router.post("/", auth, bookSeva);
router.get("/my", auth, myBookings);

// ADMIN
router.get("/all", auth, admin, allBookings);

module.exports = router;
