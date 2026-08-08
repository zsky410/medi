import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { DEMO_EMAIL_DOMAIN, DEMO_PASSWORD, DEMO_TRIPS, DEMO_USERS, type DemoPlace } from "./demo-seed-data";

const prisma = new PrismaClient();

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function tripStartDate(index: number): Date {
  const base = new Date();
  base.setUTCHours(0, 0, 0, 0);
  return addDays(base, 14 + index * 3);
}

function placeRow(tripId: string, dayId: string | null, place: DemoPlace, order: number) {
  return {
    tripId,
    dayId,
    name: place.name,
    category: place.category,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    note: place.note,
    cost: place.cost,
    order,
    estimatedDurationMinutes: place.durationMinutes,
    generationScore: 0.92,
    generationMetadata: {
      source: "demo-seed",
      curated: true,
      demoDensePlan: true,
    },
  };
}

async function resetDemoData() {
  await prisma.user.deleteMany({
    where: { email: { endsWith: `@${DEMO_EMAIL_DOMAIN}` } },
  });
}

async function seedDemoData() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = new Map<string, string>();

  for (const user of DEMO_USERS) {
    const created = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        passwordHash,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        locale: "vi",
        defaultCurrency: "VND",
        proExpiresAt: user.plan === "PRO" ? addDays(new Date(), 365) : null,
      },
    });
    users.set(user.key, created.id);
  }

  for (const [index, demoTrip] of DEMO_TRIPS.entries()) {
    const ownerId = users.get(demoTrip.ownerKey);
    if (!ownerId) throw new Error(`Missing owner for ${demoTrip.title}`);

    const memberIds = [ownerId, ...demoTrip.memberKeys.map((key) => users.get(key)).filter((id): id is string => Boolean(id))];
    const startDate = tripStartDate(index);
    const endDate = addDays(startDate, demoTrip.dayCount - 1);

    const trip = await prisma.trip.create({
      data: {
        ownerId,
        title: demoTrip.title,
        destination: demoTrip.destination,
        coverImage: demoTrip.coverImage,
        startDate,
        endDate,
        visibility: demoTrip.visibility,
        distributionMode: demoTrip.distributionMode,
        inviteCode: `demo-${demoTrip.slug}`,
        cloneCount: demoTrip.cloneCount,
        budgetAmount: demoTrip.budgetAmount,
        budgetCurrency: "VND",
        generationMetadata: {
          source: "demo-seed",
          slug: demoTrip.slug,
          denseDailyPlaces: "4-6 non-lodging places per day",
        },
        members: {
          create: memberIds.map((userId, memberIndex) => ({
            userId,
            role: memberIndex === 0 ? "OWNER" : "EDITOR",
          })),
        },
        days: {
          create: demoTrip.days.map((day) => ({
            date: addDays(startDate, day.order),
            order: day.order,
          })),
        },
      },
      include: { days: { orderBy: { order: "asc" } } },
    });

    const dayIdByOrder = new Map(trip.days.map((day) => [day.order, day.id]));
    const placeRows = [
      placeRow(trip.id, null, demoTrip.lodging, 0),
      ...demoTrip.days.flatMap((day) => {
        const dayId = dayIdByOrder.get(day.order);
        if (!dayId) throw new Error(`Missing day ${day.order} for ${demoTrip.title}`);
        return day.places.map((place, placeIndex) => placeRow(trip.id, dayId, place, placeIndex));
      }),
    ];

    await prisma.place.createMany({ data: placeRows });

    const lodgingPlace = await prisma.place.findFirstOrThrow({
      where: { tripId: trip.id, category: "LODGING" },
      orderBy: { createdAt: "asc" },
    });

    await prisma.attachment.create({
      data: {
        tripId: trip.id,
        placeId: lodgingPlace.id,
        uploaderId: ownerId,
        url: `https://demo.medi.app/bookings/${demoTrip.slug}-lodging`,
        name: `Booking ${demoTrip.lodging.name}`,
        type: "HOTEL",
        metadata: {
          source: "demo-seed",
          provider: "Demo Booking",
          checkIn: startDate.toISOString().slice(0, 10),
          checkOut: addDays(endDate, 1).toISOString().slice(0, 10),
          address: demoTrip.lodging.address,
        },
      },
    });

    await prisma.expense.create({
      data: {
        tripId: trip.id,
        title: `Chỗ ở: ${demoTrip.lodging.name}`,
        amount: demoTrip.lodging.cost * demoTrip.dayCount,
        currency: "VND",
        category: "LODGING",
        payerId: ownerId,
        date: startDate,
        splitWith: { connect: memberIds.map((id) => ({ id })) },
      },
    });

    const foodEstimate = demoTrip.days.flatMap((day) => day.places).filter((place) => place.category === "FOOD").reduce((sum, place) => sum + place.cost, 0);
    await prisma.expense.create({
      data: {
        tripId: trip.id,
        title: "Ăn uống theo lịch trình",
        amount: foodEstimate,
        currency: "VND",
        category: "FOOD",
        payerId: memberIds[1] ?? ownerId,
        date: addDays(startDate, 1),
        splitWith: { connect: memberIds.map((id) => ({ id })) },
      },
    });

    const activityEstimate = demoTrip.days
      .flatMap((day) => day.places)
      .filter((place) => place.category === "ATTRACTION" || place.category === "SHOPPING" || place.category === "OTHER")
      .reduce((sum, place) => sum + place.cost, 0);
    await prisma.expense.create({
      data: {
        tripId: trip.id,
        title: "Vé tham quan và trải nghiệm",
        amount: activityEstimate,
        currency: "VND",
        category: "ACTIVITY",
        payerId: memberIds[2] ?? ownerId,
        date: addDays(startDate, 2),
        splitWith: { connect: memberIds.map((id) => ({ id })) },
      },
    });

    await prisma.checklistItem.createMany({
      data: demoTrip.checklist.map((text, checklistIndex) => ({
        tripId: trip.id,
        text,
        checked: checklistIndex < 2,
        type: checklistIndex % 3 === 0 ? "PACKING" : "TODO",
      })),
    });

    if (demoTrip.guide) {
      await prisma.guide.create({
        data: {
          creatorId: ownerId,
          tripId: trip.id,
          title: demoTrip.guide.title,
          description: demoTrip.guide.description,
          price: demoTrip.guide.price,
          currency: demoTrip.guide.currency,
          published: true,
          purchaseCount: demoTrip.guide.purchaseCount,
        },
      });
    }
  }
}

async function main() {
  await resetDemoData();
  await seedDemoData();

  console.log(`Seeded ${DEMO_USERS.length} demo users (${DEMO_USERS.filter((user) => user.plan === "PRO").length} PRO).`);
  console.log(`Seeded ${DEMO_TRIPS.length} public demo trips with dense daily itineraries.`);
  console.log(`Seeded ${DEMO_TRIPS.filter((trip) => trip.guide).length} published creator shop guides.`);
  console.log(`Demo password for all users: ${DEMO_PASSWORD}`);
  console.log(`Demo email domain: ${DEMO_EMAIL_DOMAIN}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
