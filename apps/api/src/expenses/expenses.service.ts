import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  BudgetSummaryDto,
  CreateExpenseInput,
  CreateSettlementInput,
  ExpenseDto,
  SettlementDto,
  SimplifiedDebtDto,
  UpdateExpenseInput,
} from "@medi/types";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TripAccessService } from "../trips/trip-access.service";

const expenseInclude = {
  payer: { select: { id: true, name: true } },
  splitWith: { select: { id: true } },
} satisfies Prisma.ExpenseInclude;

const settlementInclude = {
  fromUser: { select: { id: true, name: true } },
  toUser: { select: { id: true, name: true } },
} satisfies Prisma.SettlementInclude;

type ExpenseWithRelations = Prisma.ExpenseGetPayload<{ include: typeof expenseInclude }>;
type SettlementWithUsers = Prisma.SettlementGetPayload<{ include: typeof settlementInclude }>;

function simplifyDebts(
  members: { userId: string; name: string; net: number }[],
): SimplifiedDebtDto[] {
  const creditors = members
    .filter((m) => m.net > 0.01)
    .map((m) => ({ ...m, net: m.net }))
    .sort((a, b) => b.net - a.net);
  const debtors = members
    .filter((m) => m.net < -0.01)
    .map((m) => ({ ...m, net: -m.net }))
    .sort((a, b) => b.net - a.net);

  const debts: SimplifiedDebtDto[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].net, debtors[di].net);
    if (amount > 0.01) {
      debts.push({
        fromUserId: debtors[di].userId,
        fromName: debtors[di].name,
        toUserId: creditors[ci].userId,
        toName: creditors[ci].name,
        amount: Math.round(amount),
      });
    }
    creditors[ci].net -= amount;
    debtors[di].net -= amount;
    if (creditors[ci].net < 0.01) ci++;
    if (debtors[di].net < 0.01) di++;
  }

  return debts;
}

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TripAccessService,
  ) {}

  private toDto(e: ExpenseWithRelations): ExpenseDto {
    return {
      id: e.id,
      tripId: e.tripId,
      title: e.title,
      amount: e.amount,
      currency: e.currency,
      category: e.category,
      payerId: e.payerId,
      payerName: e.payer.name,
      splitWithIds: e.splitWith.map((u) => u.id),
      date: e.date ? e.date.toISOString().slice(0, 10) : null,
      createdAt: e.createdAt.toISOString(),
    };
  }

  private settlementToDto(s: SettlementWithUsers): SettlementDto {
    return {
      id: s.id,
      tripId: s.tripId,
      fromUserId: s.fromUserId,
      fromName: s.fromUser.name,
      toUserId: s.toUserId,
      toName: s.toUser.name,
      amount: s.amount,
      currency: s.currency,
      settledAt: s.settledAt.toISOString(),
    };
  }

  async list(tripId: string, userId: string): Promise<ExpenseDto[]> {
    await this.access.assertRole(tripId, userId, "VIEWER");
    const expenses = await this.prisma.expense.findMany({
      where: { tripId },
      include: expenseInclude,
      orderBy: { createdAt: "desc" },
    });
    return expenses.map((e) => this.toDto(e));
  }

  async create(tripId: string, userId: string, input: CreateExpenseInput): Promise<ExpenseDto> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    await this.assertAllMembers(tripId, [input.payerId, ...input.splitWithIds]);
    const expense = await this.prisma.expense.create({
      data: {
        tripId,
        title: input.title,
        amount: input.amount,
        currency: input.currency,
        category: input.category,
        payerId: input.payerId,
        date: input.date ? new Date(`${input.date}T00:00:00.000Z`) : null,
        splitWith: { connect: input.splitWithIds.map((id) => ({ id })) },
      },
      include: expenseInclude,
    });
    return this.toDto(expense);
  }

  async update(tripId: string, expenseId: string, userId: string, input: UpdateExpenseInput): Promise<ExpenseDto> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    await this.assertExpenseInTrip(tripId, expenseId);
    const ids = [...(input.payerId ? [input.payerId] : []), ...(input.splitWithIds ?? [])];
    if (ids.length > 0) await this.assertAllMembers(tripId, ids);
    const expense = await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        title: input.title,
        amount: input.amount,
        currency: input.currency,
        category: input.category,
        payerId: input.payerId,
        date: input.date === undefined ? undefined : input.date ? new Date(`${input.date}T00:00:00.000Z`) : null,
        splitWith: input.splitWithIds ? { set: input.splitWithIds.map((id) => ({ id })) } : undefined,
      },
      include: expenseInclude,
    });
    return this.toDto(expense);
  }

  async remove(tripId: string, expenseId: string, userId: string): Promise<void> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    await this.assertExpenseInTrip(tripId, expenseId);
    await this.prisma.expense.delete({ where: { id: expenseId } });
  }

  async createSettlement(tripId: string, userId: string, input: CreateSettlementInput): Promise<SettlementDto> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    await this.assertAllMembers(tripId, [input.fromUserId, input.toUserId]);
    if (input.fromUserId === input.toUserId) {
      throw new BadRequestException("Không thể tự trả cho chính mình");
    }

    const settlement = await this.prisma.settlement.create({
      data: {
        tripId,
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        amount: input.amount,
        currency: input.currency,
      },
      include: settlementInclude,
    });
    return this.settlementToDto(settlement);
  }

  async listSettlements(tripId: string, userId: string): Promise<SettlementDto[]> {
    await this.access.assertRole(tripId, userId, "VIEWER");
    const settlements = await this.prisma.settlement.findMany({
      where: { tripId },
      include: settlementInclude,
      orderBy: { settledAt: "desc" },
    });
    return settlements.map((s) => this.settlementToDto(s));
  }

  /**
   * Equal-split settlement: each expense is divided evenly among its splitWith
   * members; the payer is credited the full amount. Settlements adjust nets.
   */
  async summary(tripId: string, userId: string): Promise<BudgetSummaryDto> {
    await this.access.assertRole(tripId, userId, "VIEWER");
    const [expenses, members, settlements, trip] = await Promise.all([
      this.prisma.expense.findMany({ where: { tripId }, include: expenseInclude }),
      this.prisma.tripMember.findMany({
        where: { tripId },
        include: { user: { select: { id: true, name: true } } },
      }),
      this.prisma.settlement.findMany({ where: { tripId }, include: settlementInclude }),
      this.prisma.trip.findUniqueOrThrow({ where: { id: tripId } }),
    ]);

    const byCategory: Record<string, number> = {};
    const paid = new Map<string, number>();
    const owed = new Map<string, number>();
    let total = 0;
    let currency = "VND";

    for (const e of expenses) {
      total += e.amount;
      currency = e.currency;
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
      paid.set(e.payerId, (paid.get(e.payerId) ?? 0) + e.amount);
      const share = e.splitWith.length > 0 ? e.amount / e.splitWith.length : 0;
      for (const u of e.splitWith) {
        owed.set(u.id, (owed.get(u.id) ?? 0) + share);
      }
    }

    const balances = members.map((m) => {
      let net = (paid.get(m.userId) ?? 0) - (owed.get(m.userId) ?? 0);
      for (const s of settlements) {
        if (s.fromUserId === m.userId) net += s.amount;
        if (s.toUserId === m.userId) net -= s.amount;
      }
      return {
        userId: m.userId,
        name: m.user.name,
        paid: paid.get(m.userId) ?? 0,
        owed: owed.get(m.userId) ?? 0,
        net,
      };
    });

    const budget = trip.budgetAmount;
    const budgetPercent = budget && budget > 0 ? Math.round((total / budget) * 100) : null;

    return {
      total,
      currency,
      budget,
      budgetCurrency: trip.budgetCurrency,
      budgetPercent,
      byCategory,
      balances,
      simplifiedDebts: simplifyDebts(balances),
      settlements: settlements.map((s) => this.settlementToDto(s)),
    };
  }

  private async assertAllMembers(tripId: string, userIds: string[]) {
    const unique = [...new Set(userIds)];
    const count = await this.prisma.tripMember.count({
      where: { tripId, userId: { in: unique } },
    });
    if (count !== unique.length) {
      throw new BadRequestException("Có người không phải thành viên chuyến đi");
    }
  }

  private async assertExpenseInTrip(tripId: string, expenseId: string) {
    const expense = await this.prisma.expense.findFirst({ where: { id: expenseId, tripId } });
    if (!expense) throw new NotFoundException("Không tìm thấy khoản chi");
  }
}
