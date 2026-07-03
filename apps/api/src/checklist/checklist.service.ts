import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateChecklistItemInput, UpdateChecklistItemInput } from "@medi/types";
import { PrismaService } from "../prisma/prisma.service";
import { TripAccessService } from "../trips/trip-access.service";

@Injectable()
export class ChecklistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TripAccessService,
  ) {}

  async list(tripId: string, userId: string) {
    await this.access.assertRole(tripId, userId, "VIEWER");
    return this.prisma.checklistItem.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(tripId: string, userId: string, input: CreateChecklistItemInput) {
    await this.access.assertRole(tripId, userId, "EDITOR");
    return this.prisma.checklistItem.create({
      data: { tripId, text: input.text, type: input.type },
    });
  }

  async update(tripId: string, itemId: string, userId: string, input: UpdateChecklistItemInput) {
    await this.access.assertRole(tripId, userId, "EDITOR");
    await this.assertInTrip(tripId, itemId);
    return this.prisma.checklistItem.update({
      where: { id: itemId },
      data: { text: input.text, checked: input.checked },
    });
  }

  async remove(tripId: string, itemId: string, userId: string) {
    await this.access.assertRole(tripId, userId, "EDITOR");
    await this.assertInTrip(tripId, itemId);
    await this.prisma.checklistItem.delete({ where: { id: itemId } });
  }

  private async assertInTrip(tripId: string, itemId: string) {
    const item = await this.prisma.checklistItem.findFirst({ where: { id: itemId, tripId } });
    if (!item) throw new NotFoundException("Không tìm thấy mục checklist");
  }
}
