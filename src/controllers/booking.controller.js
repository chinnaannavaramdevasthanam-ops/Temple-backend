const prisma = require("../config/prisma");

/* ==========================================
   BOOK SEVA
========================================== */
exports.bookSeva = async (req, res) => {
  try {
    const { sevaId, date } = req.body;

    if (!sevaId || !date) {
      return res.status(400).json({
        message: "Seva and date are required"
      });
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ❌ BLOCK PAST BOOKINGS
    if (bookingDate < today) {
      return res.status(400).json({
        message: "Cannot book for past dates"
      });
    }

    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const seva = await prisma.seva.findUnique({
      where: { id: Number(sevaId) }
    });

    if (!seva || !seva.active) {
      return res.status(400).json({
        message: "Invalid or inactive seva"
      });
    }

    // ❌ IF SPECIFIC DATE SEVA, BOOKING DATE MUST MATCH
    if (!seva.isDaily) {
      const sevaDate = new Date(seva.date);
      sevaDate.setHours(0, 0, 0, 0);

      if (sevaDate.getTime() !== bookingDate.getTime()) {
        return res.status(400).json({
          message: "This seva is available only on its specified date"
        });
      }
    }

    // CHECK SLOT AVAILABILITY
    const bookedCount = await prisma.booking.count({
      where: {
        sevaId: Number(sevaId),
        status: "CONFIRMED",
        date: {
          gte: bookingDate,
          lt: nextDay
        }
      }
    });

    if (bookedCount >= seva.totalSlots) {
      return res.status(400).json({
        message: "No slots available for selected date"
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        sevaId: Number(sevaId),
        date: bookingDate,
        status: "CONFIRMED"
      }
    });

    res.json({
      message: "Booking successful",
      booking
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Booking failed"
    });
  }
};

/* ==========================================
   USER BOOKINGS
========================================== */
exports.myBookings = async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    include: { seva: true },
    orderBy: { date: "desc" }
  });

  res.json(bookings);
};

/* ==========================================
   ADMIN BOOKINGS
========================================== */
exports.allBookings = async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: {
      user: {
        select: {
          name: true,
          phone: true,
          email: true
        }
      },
      seva: true
    },
    orderBy: { date: "desc" }
  });

  res.json(bookings);
};
