const { Prisma } = require("@prisma/client");

module.exports = (err, req, res, next) => {
  console.error("ERROR:", err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      success: false,
      message: "Database error",
      code: err.code
    });
  }

  // Multer file errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Custom errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
};
