const prisma = require("../config/prisma");

/**
 * PUBLIC – GET ALL ACTIVE SEVAS
 */
exports.getSevas = async (req, res) => {
  try {
    const sevas = await prisma.seva.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      // We don't need to load all bookings here for availability 
      // because availability depends on the specific date the user chooses later.
    });

    const result = sevas.map(seva => ({
      id: seva.id,
      name: seva.name,
      description: seva.description,
      price: seva.price,
      totalSlots: seva.totalSlots,
      active: seva.active,
      // Return the new fields to frontend
      isDaily: seva.isDaily,
      date: seva.date
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};

/**
 * ADMIN – CREATE SEVA
 */
exports.createSeva = async (req, res) => {
  try {
    // 1. Destructure new fields 'date' and 'isDaily'
    const { name, description, price, totalSlots, date, isDaily } = req.body;

    if (!name || !price || !totalSlots) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 2. Handle Date parsing
    let sevaDate = null;
    if (!isDaily && date) {
      sevaDate = new Date(date); // Store specific date if not daily
    }

    const seva = await prisma.seva.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        price: Number(price),
        totalSlots: Number(totalSlots),
        active: true,
        // 3. Save new fields
        isDaily: isDaily !== undefined ? isDaily : true, // Default to true
        date: sevaDate
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
