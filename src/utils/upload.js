const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

const resizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const filename = `gallery-${Date.now()}.jpg`;
  const filepath = path.join("uploads", filename);

  await sharp(req.file.buffer)
    .resize(800, 600)
    .jpeg({ quality: 80 })
    .toFile(filepath);

  req.file.filename = filename;
  next();
};

module.exports = { upload, resizeImage };
