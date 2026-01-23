const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../utils/cloudinary");

// PUBLIC – GET GALLERY
exports.getImages = async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load gallery" });
  }
};

// ADMIN – ADD IMAGE
exports.addImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "temple-gallery"
    });

    const image = await prisma.galleryImage.create({
      data: {
        imageUrl: result.secure_url
      }
    });

    res.status(201).json({ message: "Image uploaded", image });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Image upload failed" });
  }
};

// ADMIN – DELETE IMAGE
exports.deleteImage = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const image = await prisma.galleryImage.findUnique({
      where: { id }
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Extract public_id from URL
    const publicId = image.imageUrl
      .split("/")
      .slice(-2)
      .join("/")
      .replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicId);

    await prisma.galleryImage.delete({
      where: { id }
    });

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
