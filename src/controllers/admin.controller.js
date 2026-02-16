const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

/* ===============================
   DASHBOARD STATS
=============================== */
exports.dashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalSevas,
    totalBookings,
    todayBookings,
    donationSum,
    pendingDonations
  ] = await Promise.all([
    prisma.user.count(),
    prisma.seva.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { date: { gte: today } } }),
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: "SUCCESS" }
    }),
    prisma.donation.count({ where: { paymentStatus: "CREATED" } })
  ]);

  res.json({
    totalUsers,
    totalSevas,
    totalBookings,
    todayBookings,
    totalDonationAmount: donationSum._sum.amount || 0,
    pendingDonations
  });
});

/* ===============================
   RECENT ACTIVITY
=============================== */
exports.recentActivity = asyncHandler(async (req, res) => {
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { id: "desc" },
    include: {
      user: { select: { name: true, phone: true } },
      seva: { select: { name: true } }
    }
  });

  const recentDonations = await prisma.donation.findMany({
    take: 5,
    orderBy: { id: "desc" },
    include: {
      user: { select: { name: true, phone: true } }
    }
  });

  res.json({ recentBookings, recentDonations });
});

/* ===============================
   ADMIN SEVAS
=============================== */
exports.getAllSevasAdmin = asyncHandler(async (req, res) => {
  const sevas = await prisma.seva.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json(sevas);
});

exports.deactivateSeva = asyncHandler(async (req, res) => {
  await prisma.seva.update({
    where: { id: Number(req.params.id) },
    data: { active: false }
  });

  res.json({ message: "Seva deactivated" });
});

exports.activateSeva = asyncHandler(async (req, res) => {
  await prisma.seva.update({
    where: { id: Number(req.params.id) },
    data: { active: true }
  });

  res.json({ message: "Seva activated" });
});

/* ===============================
   ADMIN BOOKINGS
=============================== */
exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    orderBy: { date: "desc" },
    include: {
      user: { select: { name: true, phone: true, email: true } },
      seva: { select: { name: true, price: true } }
    }
  });

  res.json(bookings);
});

/* ===============================
   ADMIN DONATIONS
=============================== */
exports.getAllDonations = asyncHandler(async (req, res) => {
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, phone: true, email: true } }
    }
  });

  res.json(donations);
});

exports.updateDonationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["SUCCESS", "FAILED"].includes(status))
    throw new AppError("Invalid status", 400);

  await prisma.donation.update({
    where: { id: Number(req.params.id) },
    data: { paymentStatus: status }
  });

  res.json({ message: "Donation status updated" });
});
