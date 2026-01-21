const prisma = require("../config/prisma");

/**
 * PUBLIC – USERS
 * GET /api/sevas
 */
exports.getSevas = async (req, res) => {
  try {
    const sevas = await prisma.seva.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          select: { id: true }
        }
      }
    });

    const result = sevas.map(seva => ({
      id: seva.id,
      name: seva.name,
      description: seva.description,
      price: seva.price,
      totalSlots: seva.totalSlots,
      bookedSlots: seva.bookings.length,
      availableSlots: seva.totalSlots - seva.bookings.length,
      active: seva.active
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};

/**
 * ADMIN – CREATE SEVA
 * POST /api/sevas
 */
exports.createSeva = async (req, res) => {
  try {
    const { name, description, price, totalSlots } = req.body;

    if (!name || !price || !totalSlots) {
      return res.status(400).json({ message: "All fields required" });
    }

    const seva = await prisma.seva.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        price: Number(price),
        totalSlots: Number(totalSlots),
        active: true
      }
    });

    res.status(201).json(seva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create seva" });
  }
};

/**
 * ADMIN – TOGGLE SEVA STATUS
 * PATCH /api/sevas/:id/toggle
 */
exports.toggleSevaStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const seva = await prisma.seva.findUnique({
      where: { id: Number(id) }
    });

    if (!seva) {
      return res.status(404).json({ message: "Seva not found" });
    }

    const updated = await prisma.seva.update({
      where: { id: Number(id) },
      data: { active: !seva.active }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update seva status" });
  }
};

/**
 * ADMIN – ALL SEVAS (ACTIVE + INACTIVE)
 * GET /api/admin/sevas
 */
exports.getAllSevasAdmin = async (req, res) => {
  try {
    const sevas = await prisma.seva.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          select: { id: true }
        }
      }
    });

    const result = sevas.map(seva => ({
      ...seva,
      bookedSlots: seva.bookings.length,
      availableSlots: seva.totalSlots - seva.bookings.length
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};
