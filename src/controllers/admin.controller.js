const prisma = require("../config/prisma");

/* =======================
   DASHBOARD STATS
======================= */
exports.dashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

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
      prisma.booking.count({
        where: {
          date: { gte: startOfToday },
          status: "CONFIRMED"
        }
      }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: "SUCCESS" }
      }),
      prisma.donation.count({
        where: { paymentStatus: "CREATED" }
      })
    ]);

    res.json({
      totalUsers,
      totalSevas,
      totalBookings,
      todayBookings,
      totalDonationAmount: donationSum._sum.amount || 0,
      pendingDonations
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

/* =======================
   ADMIN SEVAS
======================= */
exports.getAllSevasAdmin = async (req, res) => {
  try {
    const sevas = await prisma.seva.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(sevas);
  } catch (err) {
    console.error("Admin Sevas Error:", err);
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};

/* =======================
   ADMIN BOOKINGS
======================= */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, phone: true, email: true } },
        seva: { select: { name: true, price: true } }
      },
      orderBy: { date: "desc" }
    });
    res.json(bookings);
  } catch (err) {
    console.error("Admin Bookings Error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/* =======================
   ADMIN DONATIONS
======================= */
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        user: { select: { name: true, phone: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(donations);
  } catch (err) {
    console.error("Admin Donations Error:", err);
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};
