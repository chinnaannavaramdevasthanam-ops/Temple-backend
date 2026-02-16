const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.register = asyncHandler(async (req, res) => {
  const { name, phone, email, password, confirmPassword } = req.body;

  if (!name || !phone || !email || !password || !confirmPassword)
    throw new AppError("All fields required", 400);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    throw new AppError("Invalid email format", 400);

  if (password !== confirmPassword)
    throw new AppError("Passwords do not match", 400);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    throw new AppError("User already exists", 409);

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: name.trim(),
      phone,
      email: email.toLowerCase(),
      password: hashed,
      role: "USER"
    }
  });

  res.status(201).json({ message: "Registration successful" });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError("Email and password required", 400);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user)
    throw new AppError("User not found", 404);

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    throw new AppError("Incorrect password", 401);

  const token = generateToken(user);

  // 🍪 cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  // ✅ SEND ROLE ONLY
  res.json({
    message: "Login successful",
    role: user.role,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});
