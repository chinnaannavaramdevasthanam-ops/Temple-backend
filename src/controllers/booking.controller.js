const prisma = require("../config/prisma"); // ✅ Use shared connection

exports.bookSeva = async (req, res) => {
  try {
    const { sevaId, date } = req.body;
    const requestedDate = new Date(date);

    // 1. Find Seva
    const seva = await prisma.seva.findUnique({ where: { id: Number(sevaId) } });
    if (!seva || !seva.active) return res.status(400).json({ message: "Invalid seva" });

    // 2. Date Validation
    if (!seva.isDaily) {
      const sevaDate = new Date(seva.date);
      const isSameDate = sevaDate.toISOString().split('T')[0] === requestedDate.toISOString().split('T')[0];
      if (!isSameDate) return res.status(400).json({ message: `Available only on ${sevaDate.toDateString()}` });
    }

    // 3. Check Slots (using range for robustness)
    const startOfDay = new Date(requestedDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(requestedDate); endOfDay.setHours(23,59,59,999);

    const bookedCount = await prisma.booking.count({
      where: {
        sevaId: Number(sevaId),
        status: "CONFIRMED",
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (bookedCount >= seva.totalSlots) return res.status(400).json({ message: "Housefull" });

    // 4. Create Booking
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

exports.myBookings = async (req, res) => {
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

exports.allBookings = async (req, res) => {
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