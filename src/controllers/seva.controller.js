const prisma = require("../config/prisma");

/**
 * PUBLIC – GET ALL ACTIVE SEVAS
 * Used by: Home Page, Seva Booking Page
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
      isDaily: seva.isDaily,
      date: seva.date,
      // Safety check: ensure bookings exists before accessing .length
      bookedSlots: seva.bookings ? seva.bookings.length : 0,
      availableSlots: seva.totalSlots - (seva.bookings ? seva.bookings.length : 0)
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching sevas:", err);
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

    // SAFE DATE PARSING
    let sevaDate = null;
    // Only parse date if it's NOT daily AND date string is not empty
    if (isDaily === false && date && date !== "") {
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
    console.error("Error creating seva:", err);
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
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/**
 * ADMIN – GET ALL SEVAS (Active & Inactive)
 * Used by: Admin Panel
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
      bookedSlots: seva.bookings ? seva.bookings.length : 0,
      availableSlots: seva.totalSlots - (seva.bookings ? seva.bookings.length : 0)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admin sevas" });
  }
};