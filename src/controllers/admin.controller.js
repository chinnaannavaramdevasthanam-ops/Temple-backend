const prisma = require("../config/prisma");

/* =======================
   DASHBOARD STATS
======================= */
const dashboardStats = async (req, res) => {
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
   RECENT ACTIVITY
======================= */
const recentActivity = async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Recent Activity Error:", err);
    res.status(500).json({ message: "Failed to load recent activity" });
  }
};

/* =======================
   SEVAS (ADMIN)
======================= */
const getAllSevasAdmin = async (req, res) => {
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

const deactivateSeva = async (req, res) => {
  try {
    await prisma.seva.update({
      where: { id: Number(req.params.id) },
      data: { active: false }
    });
    res.json({ message: "Seva deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to deactivate seva" });
  }
};

const activateSeva = async (req, res) => {
  try {
    await prisma.seva.update({
      where: { id: Number(req.params.id) },
      data: { active: true }
    });
    res.json({ message: "Seva activated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to activate seva" });
  }
};

/* =======================
   BOOKINGS (ADMIN)
======================= */
const getAllBookings = async (req, res) => {
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
   DONATIONS (ADMIN)
======================= */
const getAllDonations = async (req, res) => {
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

const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["SUCCESS", "FAILED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await prisma.donation.update({
      where: { id: Number(req.params.id) },
      data: { paymentStatus: status }
    });

    res.json({ message: "Donation status updated" });
  } catch (err) {
    console.error("Update Donation Error:", err);
    res.status(500).json({ message: "Failed to update donation" });
  }
};

/* =======================
   EXPORTS (CRITICAL)
======================= */
module.exports = {
  dashboardStats,
  recentActivity,
  getAllSevasAdmin,
  deactivateSeva,
  activateSeva,
  getAllBookings,
  getAllDonations,
  updateDonationStatus
};
