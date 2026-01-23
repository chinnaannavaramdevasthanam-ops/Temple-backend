const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const { upload } = require("../utils/upload");
const {
  getImages,
  addImage,
  deleteImage
} = require("../controllers/gallery.controller");

// PUBLIC
router.get("/", getImages);

// ADMIN
router.post(
  "/",
  auth,
  admin,
  upload.single("image"), // 🔥 THIS MUST BE HERE
  addImage
);

router.delete("/:id", auth, admin, deleteImage);

module.exports = router;
