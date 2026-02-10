const prisma = require("../config/prisma"); // ✅ Use shared connection

/**
 * PUBLIC – GET ALL ACTIVE SEVAS
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
      active: seva.active,
      // ✅ Return new fields so frontend doesn't crash
      isDaily: seva.isDaily, 
      date: seva.date,
      // ✅ Safety check for bookings
      bookedSlots: seva.bookings ? seva.bookings.length : 0,
      availableSlots: seva.totalSlots - (seva.bookings ? seva.bookings.length : 0)
    }));

    res.json(result);
  } catch (err) {
    console.error("Get Sevas Error:", err);
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};

/**
 * ADMIN – CREATE SEVA
 */
exports.createSeva = async (req, res) => {
  try {
    const { name, description, price, totalSlots, date, isDaily } = req.body;

    if (!name || !price || !totalSlots) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Handle Date
    let sevaDate = null;
    if (isDaily === false && date) {
      sevaDate = new Date(date);
    }

    const seva = await prisma.seva.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        price: Number(price),
        totalSlots: Number(totalSlots),
        active: true,
        isDaily: isDaily !== undefined ? isDaily : true,
        date: sevaDate
      }
    });

    res.status(201).json(seva);
  } catch (err) {
    console.error("Create Seva Error:", err);
    res.status(500).json({ message: "Failed to create seva" });
  }
};

/**
 * ADMIN – TOGGLE SEVA STATUS
 */
exports.toggleSevaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const seva = await prisma.seva.findUnique({ where: { id: Number(id) } });

    if (!seva) return res.status(404).json({ message: "Seva not found" });

    const updated = await prisma.seva.update({
      where: { id: Number(id) },
      data: { active: !seva.active }
    });

    res.json(updated);
  } catch (err) {
    console.error("Toggle Seva Error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

