const prisma = require("../config/prisma");
const cloudinary = require("../utils/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.getImages = asyncHandler(async (req, res) => {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json(images);
});

exports.addImage = asyncHandler(async (req, res) => {
  if (!req.file?.buffer)
    throw new AppError("Image required", 400);

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "temple-gallery" },
      (err, result) => (err ? reject(err) : resolve(result))
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
});

exports.deleteImage = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) throw new AppError("Image not found", 404);

  if (image.publicId)
    await cloudinary.uploader.destroy(image.publicId);

  await prisma.galleryImage.delete({ where: { id } });

  res.json({ message: "Deleted successfully" });
});
