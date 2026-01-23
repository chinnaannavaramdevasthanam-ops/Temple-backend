const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("../utils/cloudinary");

// PUBLIC
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

// ADMIN ADD
exports.addImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Image required" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "temple-gallery" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const image = await prisma.galleryImage.create({
      data: {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id
      }
    });

    res.status(201).json(image);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ADMIN DELETE
exports.deleteImage = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) return res.status(404).json({ message: "Not found" });

    // 🔥 SAFETY FIX
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await prisma.galleryImage.delete({ where: { id } });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
