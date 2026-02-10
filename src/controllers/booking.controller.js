const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.bookSeva = async (req, res) => {
  try {
    const { sevaId, date } = req.body;
    const requestedDate = new Date(date);

    // 1. Find the Seva
    const seva = await prisma.seva.findUnique({
      where: { id: Number(sevaId) }
    });

    if (!seva || !seva.active) {
      return res.status(400).json({ message: "Invalid or inactive seva" });
    }

    // 2. Validate Date Logic
    if (!seva.isDaily) {
      // If it's a specific date Seva, ensure user is booking THAT date
      const sevaDate = new Date(seva.date);
      
      // Compare YYYY-MM-DD parts to ignore time differences
      const isSameDate = 
        sevaDate.toISOString().split('T')[0] === requestedDate.toISOString().split('T')[0];

      if (!isSameDate) {
        return res.status(400).json({ 
          message: `This Seva is only available on ${sevaDate.toDateString()}` 
        });
      }
    }

    // 3. Check Slot Availability for the specific date
    // We count CONFIRMED bookings for this sevaId on this specific date
    // (Prisma filtering by date usually requires a range, but let's assume exact match logic 
    // or set times to 00:00:00 for comparison. Here is a robust way using range:)
    
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedCount = await prisma.booking.count({
      where: {
        sevaId: Number(sevaId),
        status: "CONFIRMED",
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (bookedCount >= seva.totalSlots) {
      return res.status(400).json({ message: "Housefull! No slots available for this date." });
    }

    // 4. Create Booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        sevaId: Number(sevaId),
        date: requestedDate, // Save the booking date
        status: "CONFIRMED"
      }
    });

    res.json({ message: "Booking successful", booking });

  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ message: "Booking failed due to server error" });
  }
};

exports.myBookings = async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    include: { seva: true },
    orderBy: { date: "desc" }
  });
  res.json(bookings);
};

exports.allBookings = async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: {
      user: {
        select: { name: true, phone: true, email: true }
      },
      seva: true
    },
    orderBy: { date: "desc" }
  });
  res.json(bookings);
};