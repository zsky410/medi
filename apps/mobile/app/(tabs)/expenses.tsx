import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { BudgetSummaryDto, ExpenseCategory, ExpenseDto, TripMemberDto } from "@medi/types";
import { EXPENSE_CATEGORIES } from "@medi/types";
import { createExpense, fetchExpenseSummary, fetchExpenses } from "../../lib/api";
import { Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Pill, PrimaryButton, Sheet } from "../../components/ui";
import { formatMoney } from "../../lib/format";
import { colors } from "../../lib/theme";
import { useActiveTripDetail } from "../../lib/use-active-trip";

const categoryLabels: Record<ExpenseCategory, string> = {
  LODGING: "Ở",
  FOOD: "Ăn",
  TRANSPORT: "Đi lại",
  ACTIVITY: "Chơi",
  SHOPPING: "Mua sắm",
  OTHER: "Khác",
};

function ExpenseForm({
  members,
  onSubmit,
  busy,
}: {
  members: TripMemberDto[];
  onSubmit: (input: {
    title: string;
    amount: number;
    currency: "VND";
    category: ExpenseCategory;
    payerId: string;
    splitWithIds: string[];
    date?: string | null;
  }) => Promise<void>;
  busy: boolean;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("OTHER");
  const [payerId, setPayerId] = useState(members[0]?.userId ?? "");
  const [splitWithIds, setSplitWithIds] = useState<string[]>(members.map((member) => member.userId));
  const [error, setError] = useState("");

  function toggleSplit(userId: string) {
    setSplitWithIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  }

  async function submit() {
    setError("");
    const numericAmount = Number(amount.replace(/\D/g, ""));
    if (!title.trim() || !numericAmount || !payerId || splitWithIds.length === 0) {
      setError("Nhập tên, số tiền, người trả và ít nhất một người chia.");
      return;
    }
    await onSubmit({
      title: title.trim(),
      amount: numericAmount,
      currency: "VND",
      category,
      payerId,
      splitWithIds,
      ...(date.trim() ? { date: date.trim() } : {}),
    });
    setTitle("");
    setAmount("");
    setDate("");
  }

  return (
    <View>
      <ErrorBanner message={error} />
      <Field label="Khoản chi" value={title} onChangeText={setTitle} placeholder="VD: Cà phê sáng" />
      <Field label="Số tiền" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="120000" />
      <Field label="Ngày" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <Text style={styles.sectionLabel}>Danh mục</Text>
      <View style={styles.wrap}>
        {EXPENSE_CATEGORIES.map((item) => (
          <Pill key={item} active={category === item} onPress={() => setCategory(item)}>
            {categoryLabels[item]}
          </Pill>
        ))}
      </View>
      <Text style={styles.sectionLabel}>Người trả</Text>
      <View style={styles.wrap}>
        {members.map((member) => (
          <Pill key={member.userId} active={payerId === member.userId} onPress={() => setPayerId(member.userId)} color={colors.pink}>
            {member.user.name}
          </Pill>
        ))}
      </View>
      <Text style={styles.sectionLabel}>Chia với</Text>
      <View style={styles.wrap}>
        {members.map((member) => (
          <Pill key={member.userId} active={splitWithIds.includes(member.userId)} onPress={() => toggleSplit(member.userId)} color={colors.teal}>
            {member.user.name}
          </Pill>
        ))}
      </View>
      <PrimaryButton onPress={submit} disabled={busy}>{busy ? "Đang lưu..." : "Thêm chi phí"}</PrimaryButton>
    </View>
  );
}

export default function ExpensesScreen() {
  const { detail, loading, refreshing, error: tripError, refresh } = useActiveTripDetail();
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [summary, setSummary] = useState<BudgetSummaryDto | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load(tripId: string) {
    const [nextExpenses, nextSummary] = await Promise.all([fetchExpenses(tripId), fetchExpenseSummary(tripId)]);
    setExpenses(nextExpenses);
    setSummary(nextSummary);
  }

  useEffect(() => {
    if (!detail) return;
    load(detail.id).catch((err) => setError(err instanceof Error ? err.message : "Không tải được chi phí"));
  }, [detail]);

  async function submitExpense(input: Parameters<typeof createExpense>[1]) {
    if (!detail) return;
    setBusy(true);
    setError("");
    try {
      await createExpense(detail.id, input);
      await load(detail.id);
      setSheetOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thêm được chi phí");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
    >
      <PageHeader
        title="Chi phí"
        subtitle={detail?.title ?? "Companion"}
        action={detail ? <PrimaryButton onPress={() => setSheetOpen(true)}>Thêm</PrimaryButton> : null}
      />
      <ErrorBanner message={tripError || error} />
      {!detail ? (
        <EmptyState title="Chưa có chuyến đi" body="Tạo chuyến đi trước để quản lý chi phí." />
      ) : (
        <>
          <Card style={styles.summary}>
            <Text style={styles.total}>{formatMoney(summary?.total ?? 0, summary?.currency ?? "VND")}</Text>
            <Text style={styles.meta}>
              Ngân sách: {summary?.budget ? formatMoney(summary.budget, summary.budgetCurrency) : "Chưa đặt"}
            </Text>
            {summary?.budgetPercent != null ? (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(summary.budgetPercent, 100)}%` }]} />
              </View>
            ) : null}
          </Card>
          {summary?.simplifiedDebts.length ? (
            <Card>
              <Text style={styles.cardTitle}>Gợi ý quyết toán</Text>
              {summary.simplifiedDebts.map((debt) => (
                <Text key={`${debt.fromUserId}-${debt.toUserId}`} style={styles.debt}>
                  {debt.fromName} trả {debt.toName} {formatMoney(debt.amount, summary.currency)}
                </Text>
              ))}
            </Card>
          ) : null}
          {expenses.length === 0 ? (
            <EmptyState title="Chưa có khoản chi" body="Thêm chi phí đầu tiên để cả nhóm chia tiền rõ ràng." />
          ) : (
            expenses.map((expense) => (
              <Card key={expense.id}>
                <View style={styles.expenseRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expenseTitle}>{expense.title}</Text>
                    <Text style={styles.meta}>{categoryLabels[expense.category]} · {expense.payerName}</Text>
                  </View>
                  <Text style={styles.amount}>{formatMoney(expense.amount, expense.currency)}</Text>
                </View>
              </Card>
            ))
          )}
        </>
      )}
      <Sheet title="Thêm chi phí" visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        {detail ? <ExpenseForm members={detail.members} onSubmit={submitExpense} busy={busy} /> : null}
      </Sheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 28 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  sectionLabel: { color: colors.text, fontSize: 13, fontWeight: "900", marginBottom: 8 },
  summary: { backgroundColor: colors.text },
  total: { color: "#fff", fontSize: 28, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 12, fontWeight: "800", marginTop: 3 },
  progressTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.22)", borderRadius: 99, marginTop: 14 },
  progressFill: { height: 8, backgroundColor: colors.brand, borderRadius: 99 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginBottom: 8 },
  debt: { color: colors.secondary, fontSize: 13, fontWeight: "800", marginBottom: 6 },
  expenseRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  expenseTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  amount: { color: colors.brand, fontSize: 14, fontWeight: "900" },
});
