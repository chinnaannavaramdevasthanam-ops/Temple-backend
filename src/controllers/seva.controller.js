const prisma = require("../config/prisma");

/* ==========================================
   PUBLIC – GET SEVAS BY SELECTED DATE
   GET /api/sevas?date=2026-02-11
========================================== */
exports.getSevas = async (req, res) => {
  try {
    const selectedDate = req.query.date
      ? new Date(req.query.date)
      : new Date();

    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const sevas = await prisma.seva.findMany({
      where: {
        active: true,
        OR: [
          { isDaily: true },
          {
            isDaily: false,
            date: {
              gte: selectedDate,
              lt: nextDay
            }
          }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(sevas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};

/* ==========================================
   ADMIN – CREATE SEVA
========================================== */
exports.createSeva = async (req, res) => {
  try {
    const { name, description, price, totalSlots, date, isDaily } = req.body;

    if (!name || !price || !totalSlots) {
      return res.status(400).json({
        message: "Name, price and total slots are required"
      });
    }

    if (!isDaily && !date) {
      return res.status(400).json({
        message: "Specific date is required for non-daily seva"
      });
    }

    const seva = await prisma.seva.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
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

/* ==========================================
   ADMIN – TOGGLE STATUS
========================================== */
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
