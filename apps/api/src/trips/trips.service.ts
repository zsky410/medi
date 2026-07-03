import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { customAlphabet } from "nanoid";
import type {
  CreateTripInput,
  InviteMemberInput,
  ListPublicTripsQuery,
  PublicTripDto,
  PublicTripListItemDto,
  PublicTripsListDto,
  TripDetailDto,
  TripDto,
  UpdateMemberRoleInput,
  UpdateTripInput,
} from "@medi/types";
import type { Prisma, TripRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { compressCoverImageDataUrl } from "../common/compress-image";
import { TripAccessService } from "./trip-access.service";

const generateInviteCode = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

const tripInclude = {
  members: {
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  },
} satisfies Prisma.TripInclude;

type TripWithMembers = Prisma.TripGetPayload<{ include: typeof tripInclude }>;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDate(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TripAccessService,
  ) {}

  private toDto(trip: TripWithMembers, userId?: string): TripDto {
    const myRole = userId ? trip.members.find((m) => m.userId === userId)?.role : undefined;
    const canInvite = myRole === "OWNER" || myRole === "EDITOR";
    return {
      id: trip.id,
      ownerId: trip.ownerId,
      title: trip.title,
      destination: trip.destination,
      coverImage: trip.coverImage,
      startDate: isoDate(trip.startDate),
      endDate: isoDate(trip.endDate),
      visibility: trip.visibility,
      inviteCode: canInvite ? trip.inviteCode : null,
      cloneCount: trip.cloneCount,
      budgetAmount: trip.budgetAmount,
      budgetCurrency: trip.budgetCurrency,
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      members: trip.members.map((m) => ({ userId: m.userId, role: m.role, user: m.user })),
      myRole,
    };
  }

  async create(userId: string, input: CreateTripInput): Promise<TripDto> {
    const start = parseDate(input.startDate);
    const end = parseDate(input.endDate);
    if (end < start) throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu");

    const trip = await this.prisma.trip.create({
      data: {
        ownerId: userId,
        title: input.title,
        destination: input.destination,
        coverImage: (await compressCoverImageDataUrl(input.coverImage)) ?? null,
        budgetAmount: input.budgetAmount ?? null,
        budgetCurrency: input.budgetCurrency ?? "VND",
        startDate: start,
        endDate: end,
        inviteCode: generateInviteCode(),
        members: { create: { userId, role: "OWNER" } },
        days: {
          create: this.buildDayRange(start, end).map((date, i) => ({ date, order: i })),
        },
      },
      include: tripInclude,
    });
    return this.toDto(trip, userId);
  }

  async listMine(userId: string): Promise<TripDto[]> {
    const trips = await this.prisma.trip.findMany({
      where: { members: { some: { userId } } },
      include: tripInclude,
      orderBy: { startDate: "desc" },
    });
    return trips.map((t) => this.toDto(t, userId));
  }

  async getDetail(tripId: string, userId: string): Promise<TripDetailDto> {
    await this.access.assertRole(tripId, userId, "VIEWER");
    const trip = await this.prisma.trip.findUniqueOrThrow({
      where: { id: tripId },
      include: {
        ...tripInclude,
        days: {
          orderBy: { order: "asc" },
          include: { places: { orderBy: { order: "asc" } } },
        },
        places: { where: { dayId: null }, orderBy: { order: "asc" } },
      },
    });
    return {
      ...this.toDto(trip, userId),
      days: trip.days.map((d) => ({
        id: d.id,
        tripId: d.tripId,
        date: isoDate(d.date),
        order: d.order,
        places: d.places,
      })),
      unassignedPlaces: trip.places,
    };
  }

  async update(tripId: string, userId: string, input: UpdateTripInput): Promise<TripDto> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    const current = await this.prisma.trip.findUniqueOrThrow({ where: { id: tripId } });

    const start = input.startDate ? parseDate(input.startDate) : current.startDate;
    const end = input.endDate ? parseDate(input.endDate) : current.endDate;
    if (end < start) throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu");

    const trip = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        title: input.title,
        destination: input.destination,
        coverImage:
          input.coverImage !== undefined
            ? await compressCoverImageDataUrl(input.coverImage)
            : undefined,
        budgetAmount: input.budgetAmount,
        budgetCurrency: input.budgetCurrency,
        visibility: input.visibility,
        startDate: start,
        endDate: end,
      },
      include: tripInclude,
    });

    if (input.startDate || input.endDate) {
      await this.syncDays(tripId, start, end);
    }
    return this.toDto(trip, userId);
  }

  async remove(tripId: string, userId: string): Promise<void> {
    await this.access.assertRole(tripId, userId, "OWNER");
    await this.prisma.trip.delete({ where: { id: tripId } });
  }

  /** Public, unauthenticated view of a trip. Only for LINK/PUBLIC visibility. */
  async getPublic(tripId: string): Promise<PublicTripDto> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        owner: { select: { name: true } },
        _count: { select: { members: true, places: true } },
        days: {
          orderBy: { order: "asc" },
          include: { places: { orderBy: { order: "asc" } } },
        },
        places: { where: { dayId: null }, orderBy: { order: "asc" } },
      },
    });
    if (!trip || trip.visibility === "PRIVATE") {
      throw new NotFoundException("Lịch trình không tồn tại hoặc không được chia sẻ công khai");
    }
    return {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      coverImage: trip.coverImage,
      startDate: isoDate(trip.startDate),
      endDate: isoDate(trip.endDate),
      ownerName: trip.owner.name,
      memberCount: trip._count.members,
      placeCount: trip._count.places,
      cloneCount: trip.cloneCount,
      days: trip.days.map((d) => ({
        id: d.id,
        tripId: d.tripId,
        date: isoDate(d.date),
        order: d.order,
        places: d.places,
      })),
      savedPlaces: trip.places,
    };
  }

  /** Remix: copy a shared trip (days, places, checklist) into the user's account. */
  async clone(tripId: string, userId: string): Promise<TripDto> {
    const source = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        members: true,
        checklist: true,
        days: { orderBy: { order: "asc" }, include: { places: true } },
        places: { where: { dayId: null } },
      },
    });
    if (!source) throw new NotFoundException("Không tìm thấy lịch trình");
    const isMember = source.members.some((m) => m.userId === userId);
    if (source.visibility === "PRIVATE" && !isMember) {
      throw new NotFoundException("Lịch trình này không được chia sẻ công khai");
    }

    const created = await this.prisma.trip.create({
      data: {
        ownerId: userId,
        title: `${source.title} (bản sao)`,
        destination: source.destination,
        coverImage: source.coverImage,
        startDate: source.startDate,
        endDate: source.endDate,
        inviteCode: generateInviteCode(),
        members: { create: { userId, role: "OWNER" } },
        days: { create: source.days.map((d) => ({ date: d.date, order: d.order })) },
      },
      include: { days: { orderBy: { order: "asc" } } },
    });

    const dayIdMap = new Map(source.days.map((d, i) => [d.id, created.days[i].id]));
    const allPlaces = [...source.days.flatMap((d) => d.places), ...source.places];
    if (allPlaces.length > 0) {
      await this.prisma.place.createMany({
        data: allPlaces.map((p) => ({
          tripId: created.id,
          dayId: p.dayId ? (dayIdMap.get(p.dayId) ?? null) : null,
          name: p.name,
          lat: p.lat,
          lng: p.lng,
          category: p.category,
          address: p.address,
          note: p.note,
          order: p.order,
          cost: p.cost,
          providerId: p.providerId,
        })),
      });
    }
    if (source.checklist.length > 0) {
      await this.prisma.checklistItem.createMany({
        data: source.checklist.map((c) => ({ tripId: created.id, text: c.text, type: c.type })),
      });
    }

    const full = await this.prisma.trip.findUniqueOrThrow({
      where: { id: created.id },
      include: tripInclude,
    });

    if (source.ownerId !== userId) {
      await this.prisma.trip.update({
        where: { id: tripId },
        data: { cloneCount: { increment: 1 } },
      });
    }

    return this.toDto(full, userId);
  }

  /** Paginated list of public trips for the Explore feed. */
  async listPublic(query: ListPublicTripsQuery): Promise<PublicTripsListDto> {
    const where = {
      visibility: "PUBLIC" as const,
      ...(query.destination
        ? { destination: { contains: query.destination, mode: "insensitive" as const } }
        : {}),
    };

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: {
          owner: { select: { name: true } },
          _count: { select: { members: true, places: true, days: true } },
        },
        orderBy: query.sort === "recent" ? { createdAt: "desc" } : { cloneCount: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.trip.count({ where }),
    ]);

    const items: PublicTripListItemDto[] = trips.map((t) => ({
      id: t.id,
      title: t.title,
      destination: t.destination,
      coverImage: t.coverImage,
      startDate: isoDate(t.startDate),
      endDate: isoDate(t.endDate),
      ownerName: t.owner.name,
      memberCount: t._count.members,
      placeCount: t._count.places,
      cloneCount: t.cloneCount,
      dayCount: t._count.days,
    }));

    return { items, total };
  }

  async inviteMember(tripId: string, userId: string, input: InviteMemberInput) {
    await this.access.assertRole(tripId, userId, "EDITOR");
    const invitee = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!invitee) {
      throw new NotFoundException("Không tìm thấy người dùng với email này. Họ cần đăng ký tài khoản trước.");
    }
    const existing = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: invitee.id } },
    });
    if (existing?.role === "OWNER") {
      throw new BadRequestException("Không thể thay đổi vai trò chủ chuyến đi");
    }
    await this.prisma.tripMember.upsert({
      where: { tripId_userId: { tripId, userId: invitee.id } },
      update: { role: input.role },
      create: { tripId, userId: invitee.id, role: input.role },
    });
    return this.getMembers(tripId);
  }

  async joinByCode(code: string, userId: string): Promise<TripDto> {
    const trip = await this.prisma.trip.findUnique({ where: { inviteCode: code }, include: tripInclude });
    if (!trip) throw new NotFoundException("Link mời không hợp lệ");
    await this.prisma.tripMember.upsert({
      where: { tripId_userId: { tripId: trip.id, userId } },
      update: {},
      create: { tripId: trip.id, userId, role: "EDITOR" },
    });
    const updated = await this.prisma.trip.findUniqueOrThrow({ where: { id: trip.id }, include: tripInclude });
    return this.toDto(updated, userId);
  }

  async updateMemberRole(tripId: string, actorId: string, memberId: string, input: UpdateMemberRoleInput) {
    await this.access.assertRole(tripId, actorId, "OWNER");
    await this.assertNotOwner(tripId, memberId, "Không thể đổi vai trò của chủ chuyến đi");
    await this.prisma.tripMember.update({
      where: { tripId_userId: { tripId, userId: memberId } },
      data: { role: input.role as TripRole },
    });
    return this.getMembers(tripId);
  }

  async removeMember(tripId: string, actorId: string, memberId: string) {
    if (actorId !== memberId) {
      await this.access.assertRole(tripId, actorId, "OWNER");
    }
    await this.assertNotOwner(tripId, memberId, "Chủ chuyến đi không thể rời đi. Hãy xoá chuyến đi hoặc chuyển quyền.");
    await this.prisma.tripMember.delete({ where: { tripId_userId: { tripId, userId: memberId } } });
    return this.getMembers(tripId);
  }

  private async assertNotOwner(tripId: string, userId: string, message: string) {
    const membership = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!membership) throw new NotFoundException("Không tìm thấy thành viên");
    if (membership.role === "OWNER") throw new ForbiddenException(message);
  }

  private async getMembers(tripId: string) {
    const members = await this.prisma.tripMember.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    return members.map((m) => ({ userId: m.userId, role: m.role, user: m.user }));
  }

  private buildDayRange(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86_400_000)) {
      days.push(new Date(d));
    }
    return days;
  }

  /** Add days for new dates, remove days outside the range (places become unassigned via SetNull). */
  private async syncDays(tripId: string, start: Date, end: Date) {
    const wanted = this.buildDayRange(start, end);
    const existing = await this.prisma.day.findMany({ where: { tripId } });
    const existingByDate = new Map(existing.map((d) => [isoDate(d.date), d]));
    const wantedKeys = new Set(wanted.map(isoDate));

    const toDelete = existing.filter((d) => !wantedKeys.has(isoDate(d.date))).map((d) => d.id);

    await this.prisma.$transaction([
      this.prisma.day.deleteMany({ where: { id: { in: toDelete } } }),
      ...wanted.map((date, i) => {
        const found = existingByDate.get(isoDate(date));
        return found
          ? this.prisma.day.update({ where: { id: found.id }, data: { order: i } })
          : this.prisma.day.create({ data: { tripId, date, order: i } });
      }),
    ]);
  }
}
