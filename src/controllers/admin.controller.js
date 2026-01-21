const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* =======================
   DASHBOARD STATS
======================= */
exports.dashboardStats = async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

/* =======================
   RECENT ACTIVITY
======================= */
exports.recentActivity = async (req, res) => {
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
  } catch {
    res.status(500).json({ message: "Failed to load recent activity" });
  }
};

/* =======================
   SEVAS (ADMIN)
======================= */
exports.getAllSevasAdmin = async (req, res) => {
  try {
    const sevas = await prisma.seva.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(sevas);
  } catch {
    res.status(500).json({ message: "Failed to fetch sevas" });
  }
};

exports.deactivateSeva = async (req, res) => {
  try {
    await prisma.seva.update({
      where: { id: Number(req.params.id) },
      data: { active: false }
    });

    res.json({ message: "Seva deactivated" });
  } catch {
    res.status(500).json({ message: "Failed to deactivate seva" });
  }
};

exports.activateSeva = async (req, res) => {
  try {
    await prisma.seva.update({
      where: { id: Number(req.params.id) },
      data: { active: true }
    });

    res.json({ message: "Seva activated" });
  } catch {
    res.status(500).json({ message: "Failed to activate seva" });
  }
};

/* =======================
   BOOKINGS (ADMIN)
======================= */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { date: "desc" },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        seva: {
          select: {
            name: true,
            price: true
          }
        }
      }
    });

    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/* =======================
   DONATIONS (ADMIN)
======================= */
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    res.json(donations);
  } catch {
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};

exports.updateDonationStatus = async (req, res) => {
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
  } catch {
    res.status(500).json({ message: "Failed to update donation" });
  }
};
