const prisma = require("../config/prisma");

/* ================================
   PUBLIC – ACTIVE SEVAS
================================ */
exports.getSevas = async (req, res) => {
  try {
    const sevas = await prisma.seva.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" }
    });

    res.json(sevas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};

/* ================================
   ADMIN – CREATE SEVA
================================ */
exports.createSeva = async (req, res) => {
  try {
    const { name, description, price, totalSlots, date, isDaily } = req.body;

    if (!name || !price || !totalSlots) {
      return res.status(400).json({ message: "Name, price and slots are required" });
    }

    const seva = await prisma.seva.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: Number(price),
        totalSlots: Number(totalSlots),
        date: isDaily ? null : new Date(date),
        isDaily: isDaily ?? true,
        active: true
      }
    });

    res.status(201).json(seva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create seva" });
  }
};

/* ================================
   ADMIN – TOGGLE STATUS
================================ */
exports.toggleSevaStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const seva = await prisma.seva.findUnique({ where: { id } });

    if (!seva) {
      return res.status(404).json({ message: "Seva not found" });
    }

    const updated = await prisma.seva.update({
      where: { id },
      data: { active: !seva.active }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update seva status" });
  }
};

/* ================================
   ADMIN – ALL SEVAS
================================ */
exports.getAllSevasAdmin = async (req, res) => {
  try {
    const sevas = await prisma.seva.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json(sevas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};
