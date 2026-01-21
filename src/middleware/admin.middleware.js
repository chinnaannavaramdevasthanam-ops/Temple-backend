module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Login required"
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Admin access only"
    });
  }

  next();
};
