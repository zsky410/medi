import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { TripRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const ROLE_RANK: Record<TripRole, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

@Injectable()
export class TripAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /** Throws 404 if trip doesn't exist / user isn't a member, 403 if role is insufficient. */
  async assertRole(tripId: string, userId: string, minRole: TripRole): Promise<TripRole> {
    const membership = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!membership) {
      throw new NotFoundException("Không tìm thấy chuyến đi");
    }
    if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
      throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này");
    }
    return membership.role;
  }
}
