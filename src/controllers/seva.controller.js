const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.getSevas = asyncHandler(async (req, res) => {
  const selectedDate = req.query.date ? new Date(req.query.date) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const sevas = await prisma.seva.findMany({
    where: {
      active: true,
      OR: [
        { isDaily: true },
        { isDaily: false, date: { gte: selectedDate, lt: nextDay } }
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(sevas);
});

exports.createSeva = asyncHandler(async (req, res) => {
  const { name, description, price, totalSlots, date, isDaily } = req.body;

  if (!name || !price || !totalSlots)
    throw new AppError("Name, price and total slots required", 400);

  if (!isDaily && !date)
    throw new AppError("Date required for non-daily seva", 400);

  const seva = await prisma.seva.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      price: Number(price),
      totalSlots: Number(totalSlots),
      isDaily: isDaily ?? true,
      date: isDaily ? null : new Date(date),
      active: true
    }
  });

  res.status(201).json(seva);
});

exports.toggleSevaStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const seva = await prisma.seva.findUnique({ where: { id } });
  if (!seva) throw new AppError("Seva not found", 404);

  const updated = await prisma.seva.update({
    where: { id },
    data: { active: !seva.active }
  });

  res.json(updated);
});
