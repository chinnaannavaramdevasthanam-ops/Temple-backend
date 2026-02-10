const prisma = require("../config/prisma");

const bookSeva = async (req, res) => {
  try {
    const { sevaId, date } = req.body;
    const requestedDate = new Date(date);

    const seva = await prisma.seva.findUnique({
      where: { id: Number(sevaId) }
    });

    if (!seva || !seva.active) {
      return res.status(400).json({ message: "Invalid seva" });
    }

    const start = new Date(requestedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(requestedDate);
    end.setHours(23, 59, 59, 999);

    const bookedCount = await prisma.booking.count({
      where: {
        sevaId: Number(sevaId),
        status: "CONFIRMED",
        date: { gte: start, lte: end }
      }
    });

    if (bookedCount >= seva.totalSlots) {
      return res.status(400).json({ message: "Housefull" });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        sevaId: Number(sevaId),
        date: requestedDate,
        status: "CONFIRMED"
      }
    });

    res.json({ message: "Booking successful", booking });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ message: "Booking failed" });
  }
};

const myBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { seva: true },
      orderBy: { date: "desc" }
    });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

const allBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, phone: true, email: true } },
        seva: true
      },
      orderBy: { date: "desc" }
    });

    res.json(bookings);
  } catch (err) {
    console.error("All Bookings Error:", err);
    res.status(500).json({ message: "Failed to fetch all bookings" });
  }
};

module.exports = {
  bookSeva,
  myBookings,
  allBookings
};
