const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const bookingController = require("../controllers/booking.controller");

// USER
router.post("/", auth, bookingController.bookSeva);
router.get("/my", auth, bookingController.myBookings);

// ADMIN
router.get("/all", auth, admin, bookingController.allBookings);

module.exports = router;
