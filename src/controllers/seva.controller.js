const prisma = require("../config/prisma");

const getSevas = async (req, res) => {
  try {
    const sevas = await prisma.seva.findMany({
      where: { active: true },
      include: {
        bookings: { where: { status: "CONFIRMED" } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(
      sevas.map(s => ({
        ...s,
        bookedSlots: s.bookings.length,
        availableSlots: s.totalSlots - s.bookings.length
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};

const createSeva = async (req, res) => {
  try {
    const { name, description, price, totalSlots, date, isDaily } = req.body;

    const seva = await prisma.seva.create({
      data: {
        name,
        description,
        price: Number(price),
        totalSlots: Number(totalSlots),
        isDaily: isDaily ?? true,
        date: isDaily ? null : new Date(date),
        active: true
      }
    });

    res.status(201).json(seva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create seva" });
  }
};

const toggleSevaStatus = async (req, res) => {
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
    res.status(500).json({ message: "Failed to toggle status" });
  }
};

module.exports = {
  getSevas,
  createSeva,
  toggleSevaStatus
};
