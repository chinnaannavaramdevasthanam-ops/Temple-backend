const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
  getSevas,
  createSeva,
  toggleSevaStatus
} = require("../controllers/seva.controller");

// USER
router.get("/", getSevas);

// ADMIN
router.post("/", auth, admin, createSeva);
router.patch("/:id/toggle", auth, admin, toggleSevaStatus);

module.exports = router;
