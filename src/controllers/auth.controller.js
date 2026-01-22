const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");

// =====================
// USER REGISTRATION
// =====================
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !phone || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        phone,              // ✅ FIX IS HERE
        email,
        password: hashedPassword,
        role: "USER"
      }
    });

    res.status(201).json({
      message: "Registration successful. Please login."
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Registration failed"
    });
  }
};

// =====================
// LOGIN (USER + ADMIN)
// =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // USER NOT FOUND
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // PASSWORD MISMATCH
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    res.json({
  message: "Login successful",
  token: generateToken(user),
  role: user.role 
});

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Login failed"
    });
  }
};
