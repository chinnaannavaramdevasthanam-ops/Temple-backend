const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const sevaController = require("../controllers/seva.controller");
console.log({
  auth: typeof auth,
  admin: typeof admin,
  createSeva: typeof sevaController.createSeva
});
// PUBLIC
router.get("/", sevaController.getSevas);

// ADMIN
router.post("/", auth, admin, sevaController.createSeva);
router.patch("/:id/toggle", auth, admin, sevaController.toggleSevaStatus);

module.exports = router;
