// booking.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.bookSeva = async (req, res) => {
  const { sevaId, date } = req.body;

  const seva = await prisma.seva.findUnique({
    where: { id: Number(sevaId) }
  });

  if (!seva || !seva.active) {
    return res.status(400).json({ message: "Invalid seva" });
  }

  const booked = await prisma.booking.count({
    where: {
      sevaId: Number(sevaId),
      date: new Date(date),
      status: "CONFIRMED"
    }
  });

  if (booked >= seva.totalSlots) {
    return res.status(400).json({ message: "No slots available" });
  }

  const booking = await prisma.booking.create({
    data: {
      userId: req.user.id,
      sevaId: Number(sevaId),
      date: new Date(date),
      status: "CONFIRMED"
    }
  });

  res.json({ message: "Booking successful", booking });
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
