const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../utils/cloudinary");

// =======================
// PUBLIC – GET IMAGES
// =======================
exports.getImages = async (req, res) => {
  try {
    console.log("📥 GET /api/gallery hit");

    const images = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" }
    });

    console.log("✅ Images fetched:", images.length);
    res.json(images);
  } catch (err) {
    console.error("❌ GET GALLERY ERROR:", err);
    res.status(500).json({ message: "Failed to load gallery" });
  }
};

// =======================
// ADMIN – ADD IMAGE
// =======================
exports.addImage = async (req, res) => {
  try {
    console.log("📤 POST /api/gallery hit");

    if (!req.file) {
      console.log("❌ No file received by multer");
      return res.status(400).json({ message: "Image required" });
    }

    console.log("✅ File received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    console.log("☁️ Uploading to Cloudinary...");

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "temple-gallery" },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error);
            return reject(error);
          }
          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    console.log("✅ Cloudinary upload success:", result.secure_url);

    const image = await prisma.galleryImage.create({
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id
      }
    });

    console.log("✅ Image saved to DB with ID:", image.id);

    res.status(201).json(image);
  } catch (err) {
    console.error("🔥 UPLOAD FAILED:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// =======================
// ADMIN – DELETE IMAGE
// =======================
exports.deleteImage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log("🗑 DELETE /api/gallery/", id);

    const image = await prisma.galleryImage.findUnique({
      where: { id }
    });

    if (!image) {
      console.log("❌ Image not found in DB");
      return res.status(404).json({ message: "Image not found" });
    }

    console.log("☁️ Deleting from Cloudinary:", image.publicId);
    await cloudinary.uploader.destroy(image.publicId);

    await prisma.galleryImage.delete({ where: { id } });
    console.log("✅ Image deleted from DB");

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("🔥 DELETE FAILED:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
