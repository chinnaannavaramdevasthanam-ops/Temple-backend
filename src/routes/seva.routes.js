const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate.middleware");

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const { createSevaSchema } = require("../validators/seva.validator");
const {
  getSevas,
  createSeva,
  toggleSevaStatus
} = require("../controllers/seva.controller");

// USER
router.get("/", getSevas);

// ADMIN
router.post("/", auth, admin, validate(createSevaSchema), createSeva);

router.patch("/:id/toggle", auth, admin, toggleSevaStatus);

module.exports = router;
