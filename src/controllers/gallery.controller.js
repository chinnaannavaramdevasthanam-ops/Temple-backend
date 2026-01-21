const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

// PUBLIC
exports.getImages = async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(images);
  } catch {
    res.status(500).json({ message: "Failed to load gallery" });
  }
};

// ADMIN ADD
exports.addImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image required" });
  }

  const image = await prisma.galleryImage.create({
    data: { imageUrl: `/uploads/${req.file.filename}` }
  });

  res.status(201).json({ message: "Image uploaded", image });
};

// ADMIN DELETE
exports.deleteImage = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const image = await prisma.galleryImage.findUnique({
      where: { id }
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    await prisma.galleryImage.delete({
      where: { id }
    });

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("DELETE IMAGE ERROR:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};

