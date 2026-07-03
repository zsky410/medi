import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("medi1234", 10);

  const demo = await prisma.user.upsert({
    where: { email: "demo@medi.app" },
    update: {},
    create: { email: "demo@medi.app", name: "Demo Mê Đi", passwordHash: password },
  });
  const friend = await prisma.user.upsert({
    where: { email: "ban@medi.app" },
    update: {},
    create: { email: "ban@medi.app", name: "Bạn Đồng Hành", passwordHash: password },
  });

  const existing = await prisma.trip.findFirst({ where: { ownerId: demo.id, title: "Đà Lạt 3 ngày 2 đêm" } });
  if (existing) {
    console.log("Seed data already exists, skipping.");
    return;
  }

  const dates = ["2026-08-14", "2026-08-15", "2026-08-16"];
  const trip = await prisma.trip.create({
    data: {
      ownerId: demo.id,
      title: "Đà Lạt 3 ngày 2 đêm",
      destination: "Đà Lạt, Lâm Đồng",
      coverImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&fit=crop&auto=format",
      budgetAmount: 5000000,
      budgetCurrency: "VND",
      visibility: "PUBLIC",
      cloneCount: 12,
      startDate: new Date(`${dates[0]}T00:00:00.000Z`),
      endDate: new Date(`${dates[2]}T00:00:00.000Z`),
      inviteCode: "dalat-demo",
      members: {
        create: [
          { userId: demo.id, role: "OWNER" },
          { userId: friend.id, role: "EDITOR" },
        ],
      },
      days: {
        create: dates.map((d, i) => ({ date: new Date(`${d}T00:00:00.000Z`), order: i })),
      },
    },
    include: { days: { orderBy: { order: "asc" } } },
  });

  const [day1, day2, day3] = trip.days;
  await prisma.place.createMany({
    data: [
      { tripId: trip.id, dayId: day1.id, name: "Hồ Xuân Hương", category: "ATTRACTION", lat: 11.9416, lng: 108.4441, order: 0, note: "Đi dạo buổi chiều" },
      { tripId: trip.id, dayId: day1.id, name: "Chợ đêm Đà Lạt", category: "FOOD", lat: 11.9427, lng: 108.4358, order: 1, cost: 300000 },
      { tripId: trip.id, dayId: day2.id, name: "Thung lũng Tình Yêu", category: "ATTRACTION", lat: 11.9764, lng: 108.4494, order: 0, cost: 250000 },
      { tripId: trip.id, dayId: day2.id, name: "Bánh căn Lệ", category: "FOOD", lat: 11.9435, lng: 108.4379, order: 1, cost: 100000 },
      { tripId: trip.id, dayId: day3.id, name: "Ga Đà Lạt", category: "ATTRACTION", lat: 11.9417, lng: 108.4547, order: 0 },
      { tripId: trip.id, name: "Quán cà phê Túi Mơ To", category: "FOOD", lat: 11.9231, lng: 108.4265, order: 0, note: "Nếu còn thời gian" },
    ],
  });

  await prisma.expense.create({
    data: {
      tripId: trip.id,
      title: "Homestay 2 đêm",
      amount: 1200000,
      currency: "VND",
      category: "LODGING",
      payerId: demo.id,
      date: new Date(`${dates[0]}T00:00:00.000Z`),
      splitWith: { connect: [{ id: demo.id }, { id: friend.id }] },
    },
  });

  await prisma.checklistItem.createMany({
    data: [
      { tripId: trip.id, text: "Đặt vé xe khách", type: "TODO", checked: true },
      { tripId: trip.id, text: "Áo khoác ấm", type: "PACKING" },
      { tripId: trip.id, text: "Sạc dự phòng", type: "PACKING" },
    ],
  });

  console.log("Seeded demo data:");
  console.log("  demo@medi.app / medi1234");
  console.log("  ban@medi.app  / medi1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
