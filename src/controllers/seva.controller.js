exports.getSevas = async (req, res) => {
  try {
    const sevas = await prisma.seva.findMany({
      where: { active: true },
      include: {
        bookings: {
          where: { status: "CONFIRMED" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const result = sevas.map(seva => ({
      ...seva,
      bookedSlots: seva.bookings.length,
      availableSlots: seva.totalSlots - seva.bookings.length
    }));

    res.json(result);
  } catch (err) {
    console.error("Get Sevas Error:", err);
    res.status(500).json({ message: "Failed to load sevas" });
  }
};
