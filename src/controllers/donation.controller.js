const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// USER: CREATE DONATION
exports.createDonation = async (req, res) => {
  try {
    const { amount, transactionId } = req.body;

    if (!amount || !transactionId) {
      return res.status(400).json({
        message: "Amount and transactionId are required"
      });
    }

    const donation = await prisma.donation.create({
      data: {
        userId: req.user.id,
        amount: Number(amount),
        razorpayId: transactionId,
        paymentStatus: "CREATED"
      }
    });

    res.status(201).json({
      message: "Donation submitted, pending approval",
      donation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Donation failed" });
  }
};

// USER: MY DONATIONS
exports.myDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });

    res.json(donations);
  } catch {
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};

// ADMIN: ALL DONATIONS
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(donations);
  } catch {
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};

// ADMIN: UPDATE DONATION STATUS
exports.updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["SUCCESS", "FAILED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const donation = await prisma.donation.update({
      where: { id: Number(id) },
      data: { paymentStatus: status }
    });

    res.json({
      message: `Donation marked as ${status}`,
      donation
    });
  } catch {
    res.status(500).json({ message: "Status update failed" });
  }
};
