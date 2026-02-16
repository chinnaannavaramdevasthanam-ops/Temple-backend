const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");

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
    include: { user: { select: { name: true, phone: true } } }
  });

  res.json({ recentBookings, recentDonations });
});
