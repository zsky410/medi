import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "LODGING",
  "FOOD",
  "TRANSPORT",
  "ACTIVITY",
  "SHOPPING",
  "OTHER",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const createExpenseSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  currency: z.string().length(3).default("VND"),
  category: z.enum(EXPENSE_CATEGORIES).default("OTHER"),
  payerId: z.string(),
  splitWithIds: z.array(z.string()).min(1, "Chọn ít nhất 1 người chia"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial();
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export interface ExpenseDto {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  payerId: string;
  payerName: string;
  splitWithIds: string[];
  date: string | null;
  createdAt: string;
}

/** Net balance per member: positive = others owe them money. */
export interface BalanceDto {
  userId: string;
  name: string;
  paid: number;
  owed: number;
  net: number;
}

/** Minimum transfer to settle group debts. */
export interface SimplifiedDebtDto {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface SettlementDto {
  id: string;
  tripId: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
  currency: string;
  settledAt: string;
}

export const createSettlementSchema = z.object({
  fromUserId: z.string(),
  toUserId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("VND"),
});
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;

export interface BudgetSummaryDto {
  total: number;
  currency: string;
  budget: number | null;
  budgetCurrency: string;
  budgetPercent: number | null;
  byCategory: Record<string, number>;
  balances: BalanceDto[];
  simplifiedDebts: SimplifiedDebtDto[];
  settlements: SettlementDto[];
}
