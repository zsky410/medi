import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  createExpenseSchema,
  createSettlementSchema,
  updateExpenseSchema,
  type CreateExpenseInput,
  type CreateSettlementInput,
  type UpdateExpenseInput,
} from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { ZodPipe } from "../common/zod.pipe";
import { TripsGateway } from "../realtime/trips.gateway";
import { ExpensesService } from "./expenses.service";

@UseGuards(JwtGuard)
@Controller("trips/:tripId/expenses")
export class ExpensesController {
  constructor(
    private readonly expenses: ExpensesService,
    private readonly realtime: TripsGateway,
  ) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Param("tripId") tripId: string) {
    return this.expenses.list(tripId, user.id);
  }

  @Get("summary")
  summary(@CurrentUser() user: JwtUser, @Param("tripId") tripId: string) {
    return this.expenses.summary(tripId, user.id);
  }

  @Get("settlements")
  listSettlements(@CurrentUser() user: JwtUser, @Param("tripId") tripId: string) {
    return this.expenses.listSettlements(tripId, user.id);
  }

  @Post("settlements")
  async createSettlement(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Body(new ZodPipe(createSettlementSchema)) input: CreateSettlementInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const settlement = await this.expenses.createSettlement(tripId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "expenses:changed" }, socketId);
    return settlement;
  }

  @Post()
  async create(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Body(new ZodPipe(createExpenseSchema)) input: CreateExpenseInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const expense = await this.expenses.create(tripId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "expenses:changed" }, socketId);
    return expense;
  }

  @Patch(":expenseId")
  async update(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("expenseId") expenseId: string,
    @Body(new ZodPipe(updateExpenseSchema)) input: UpdateExpenseInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const expense = await this.expenses.update(tripId, expenseId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "expenses:changed" }, socketId);
    return expense;
  }

  @Delete(":expenseId")
  async remove(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("expenseId") expenseId: string,
    @Headers("x-socket-id") socketId?: string,
  ) {
    await this.expenses.remove(tripId, expenseId, user.id);
    this.realtime.emitToTrip(tripId, { type: "expenses:changed" }, socketId);
    return { ok: true };
  }
}
