const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const { upload, resizeImage } = require("../utils/upload");
const {
  getImages,
  addImage,
  deleteImage
} = require("../controllers/gallery.controller");

// PUBLIC
router.get("/", getImages);

// ADMIN
router.post("/", auth, admin, upload.single("image"), resizeImage, addImage);
router.delete(
  "/:id",
  auth,
  admin,
  deleteImage
);


module.exports = router;
