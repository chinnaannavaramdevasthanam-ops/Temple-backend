const express = require("express");
const router = express.Router();
const multer = require("multer");

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
  getImages,
  addImage,
  deleteImage
} = require("../controllers/gallery.controller");

// TEMP STORAGE (Cloudinary handles final storage)
const upload = multer({ dest: "tmp/" });

// PUBLIC
router.get("/", getImages);

// ADMIN
router.post("/", auth, admin, upload.single("image"), addImage);
router.delete("/:id", auth, admin, deleteImage);

module.exports = router;
