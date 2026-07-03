import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { AttachmentDto, BookingMetadata, CreateAttachmentInput, ExpenseCategory, UpdateAttachmentInput } from "@medi/types";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TripAccessService } from "../trips/trip-access.service";

const attachmentInclude = {
  uploader: { select: { name: true } },
} satisfies Prisma.AttachmentInclude;

type AttachmentWithUploader = Prisma.AttachmentGetPayload<{ include: typeof attachmentInclude }>;

const FREE_ATTACHMENT_LIMIT = 3;

const BOOKING_TYPES = new Set(["flight", "lodging", "car", "train", "booking", "other"]);

function expenseCategoryForType(type: string): ExpenseCategory {
  if (type === "lodging") return "LODGING";
  if (type === "flight" || type === "train" || type === "car") return "TRANSPORT";
  return "OTHER";
}

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TripAccessService,
  ) {}

  private toDto(a: AttachmentWithUploader): AttachmentDto {
    return {
      id: a.id,
      tripId: a.tripId,
      placeId: a.placeId,
      url: a.url,
      name: a.name,
      type: a.type,
      metadata: (a.metadata as BookingMetadata | null) ?? null,
      uploaderName: a.uploader?.name ?? null,
      createdAt: a.createdAt.toISOString(),
    };
  }

  async list(tripId: string, userId: string): Promise<AttachmentDto[]> {
    await this.access.assertRole(tripId, userId, "VIEWER");
    const attachments = await this.prisma.attachment.findMany({
      where: { tripId },
      include: attachmentInclude,
      orderBy: { createdAt: "desc" },
    });
    return attachments.map((a) => this.toDto(a));
  }

  async create(tripId: string, userId: string, input: CreateAttachmentInput): Promise<AttachmentDto> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (user.plan !== "PRO") {
      const count = await this.prisma.attachment.count({ where: { tripId } });
      if (count >= FREE_ATTACHMENT_LIMIT) {
        throw new ForbiddenException(`Tài khoản FREE chỉ được đính kèm tối đa ${FREE_ATTACHMENT_LIMIT} file. Nâng cấp PRO để không giới hạn.`);
      }
    }

    if (input.placeId) {
      const place = await this.prisma.place.findFirst({ where: { id: input.placeId, tripId } });
      if (!place) throw new NotFoundException("Địa điểm không thuộc chuyến đi này");
    }

    let metadata: BookingMetadata | null = input.metadata ?? null;

    if (metadata?.amount && BOOKING_TYPES.has(input.type)) {
      const members = await this.prisma.tripMember.findMany({
        where: { tripId },
        select: { userId: true },
      });
      const memberIds = members.map((m) => m.userId);
      const expense = await this.prisma.expense.create({
        data: {
          tripId,
          title: input.name?.trim() || "Đặt chỗ",
          amount: metadata.amount,
          currency: metadata.currency ?? "VND",
          category: expenseCategoryForType(input.type),
          payerId: userId,
          date: metadata.startDate ? new Date(`${metadata.startDate}T00:00:00.000Z`) : null,
          splitWith: { connect: memberIds.map((id) => ({ id })) },
        },
      });
      metadata = { ...metadata, expenseId: expense.id };
    }

    const attachment = await this.prisma.attachment.create({
      data: {
        tripId,
        placeId: input.placeId ?? null,
        url: input.url,
        name: input.name ?? null,
        type: input.type,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
        uploaderId: userId,
      },
      include: attachmentInclude,
    });
    return this.toDto(attachment);
  }

  async remove(tripId: string, attachmentId: string, userId: string): Promise<void> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    const attachment = await this.prisma.attachment.findFirst({ where: { id: attachmentId, tripId } });
    if (!attachment) throw new NotFoundException("Không tìm thấy file đính kèm");

    const metadata = attachment.metadata as BookingMetadata | null;
    if (metadata?.expenseId) {
      const expense = await this.prisma.expense.findFirst({
        where: { id: metadata.expenseId, tripId },
      });
      if (expense) await this.prisma.expense.delete({ where: { id: expense.id } });
    }

    await this.prisma.attachment.delete({ where: { id: attachmentId } });
  }

  async update(
    tripId: string,
    attachmentId: string,
    userId: string,
    input: UpdateAttachmentInput,
  ): Promise<AttachmentDto> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, tripId },
    });
    if (!attachment) throw new NotFoundException("Không tìm thấy file đính kèm");

    const prevMeta = (attachment.metadata as BookingMetadata | null) ?? {};
    const nextMeta: BookingMetadata = {
      currency: "VND",
      ...prevMeta,
      ...(input.metadata ?? {}),
    };

    const title = input.name?.trim() ?? attachment.name ?? "Đặt chỗ";

    if (input.metadata?.amount !== undefined && BOOKING_TYPES.has(attachment.type)) {
      const amount = input.metadata.amount;
      if (amount && amount > 0) {
        if (nextMeta.expenseId) {
          await this.prisma.expense.update({
            where: { id: nextMeta.expenseId },
            data: {
              title,
              amount,
              currency: nextMeta.currency ?? "VND",
              category: expenseCategoryForType(attachment.type),
              date: nextMeta.startDate ? new Date(`${nextMeta.startDate}T00:00:00.000Z`) : null,
            },
          });
        } else {
          const members = await this.prisma.tripMember.findMany({
            where: { tripId },
            select: { userId: true },
          });
          const expense = await this.prisma.expense.create({
            data: {
              tripId,
              title,
              amount,
              currency: nextMeta.currency ?? "VND",
              category: expenseCategoryForType(attachment.type),
              payerId: userId,
              date: nextMeta.startDate ? new Date(`${nextMeta.startDate}T00:00:00.000Z`) : null,
              splitWith: { connect: members.map((m) => ({ id: m.userId })) },
            },
          });
          nextMeta.expenseId = expense.id;
        }
      }
    } else if (nextMeta.expenseId && input.name) {
      await this.prisma.expense.update({
        where: { id: nextMeta.expenseId },
        data: { title },
      });
    }

    const updated = await this.prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        name: input.name !== undefined ? input.name : undefined,
        url: input.url !== undefined ? input.url : undefined,
        metadata: nextMeta as Prisma.InputJsonValue,
      },
      include: attachmentInclude,
    });
    return this.toDto(updated);
  }
}
