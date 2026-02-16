const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.bookSeva = asyncHandler(async (req, res) => {
  const { sevaId, date } = req.body;
  if (!sevaId || !date)
    throw new AppError("Seva and date required", 400);

  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today)
    throw new AppError("Cannot book past dates", 400);

  const nextDay = new Date(bookingDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const seva = await prisma.seva.findUnique({
    where: { id: Number(sevaId) }
  });

  if (!seva || !seva.active)
    throw new AppError("Invalid or inactive seva", 400);

  if (!seva.isDaily) {
    const sevaDate = new Date(seva.date);
    sevaDate.setHours(0, 0, 0, 0);
    if (sevaDate.getTime() !== bookingDate.getTime())
      throw new AppError("Seva only available on its date", 400);
  }

  const bookedCount = await prisma.booking.count({
    where: {
      sevaId: Number(sevaId),
      status: "CONFIRMED",
      date: { gte: bookingDate, lt: nextDay }
    }
  });

  if (bookedCount >= seva.totalSlots)
    throw new AppError("No slots available", 400);

  const booking = await prisma.booking.create({
    data: {
      userId: req.user.id,
      sevaId: Number(sevaId),
      date: bookingDate,
      status: "CONFIRMED"
    }
  });

  res.json({ message: "Booking successful", booking });
});

exports.myBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    include: { seva: true },
    orderBy: { date: "desc" }
  });
  res.json(bookings);
});

exports.allBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { name: true, phone: true, email: true } },
      seva: true
    },
    orderBy: { date: "desc" }
  });

  res.json(bookings);
});
