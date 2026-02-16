const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.createDonation = asyncHandler(async (req, res) => {
  const { amount, transactionId } = req.body;
  if (!amount || !transactionId)
    throw new AppError("Amount and transactionId required", 400);

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
});

exports.myDonations = asyncHandler(async (req, res) => {
  const donations = await prisma.donation.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" }
  });
  res.json(donations);
});

exports.getAllDonations = asyncHandler(async (req, res) => {
  const donations = await prisma.donation.findMany({
    include: {
      user: { select: { name: true, phone: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(donations);
});

exports.updateDonationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["SUCCESS", "FAILED"].includes(status))
    throw new AppError("Invalid status", 400);

  const donation = await prisma.donation.update({
    where: { id: Number(req.params.id) },
    data: { paymentStatus: status }
  });

  res.json({ message: `Donation marked as ${status}`, donation });
});
