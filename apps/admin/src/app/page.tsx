"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Bot,
  Compass,
  CreditCard,
  Eye,
  FileClock,
  KeyRound,
  LayoutDashboard,
  Link2,
  Lock,
  LogOut,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type {
  AdminAffiliateClickDto,
  AdminDashboardDto,
  AdminGuideDto,
  AdminListDto,
  AdminPaymentIntentDto,
  AdminSystemConfigDto,
  AdminTripDto,
  AdminUserDto,
} from "@medi/types";
import { RequireAuth } from "@/components/require-auth";
import { Logo } from "@/components/logo";
import { Button, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type AdminTab = "dashboard" | "users" | "trips" | "payments" | "guides" | "affiliate" | "system" | "audit";

interface AuditLogDto {
  id: string;
  actor: { id: string; email: string; name: string } | null;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: string;
}

const tabs: Array<{ id: AdminTab; label: string; icon: typeof Users }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "trips", label: "Trips", icon: Compass },
  { id: "payments", label: "Billing", icon: CreditCard },
  { id: "guides", label: "Guides", icon: ShoppingBag },
  { id: "affiliate", label: "Affiliate", icon: Link2 },
  { id: "system", label: "System", icon: KeyRound },
  { id: "audit", label: "Audit", icon: FileClock },
];

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function money(value: number, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function date(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
}

function queryString(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "hot" }) {
  const tones = {
    neutral: "border-[#E8D6C3] bg-white text-[#5C534A]",
    good: "border-[#BFE6D2] bg-[#EAF8F0] text-[#176B45]",
    warn: "border-[#F3D68A] bg-[#FFF6D8] text-[#826113]",
    bad: "border-[#F1B7AE] bg-[#FFF0ED] text-[#B83228]",
    hot: "border-brand-200 bg-[#FFF0E8] text-brand-800",
  };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${tones[tone]}`}>{children}</span>;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="m-4 flex min-h-60 items-center justify-center rounded-[24px] border border-dashed border-[#E8D6C3] bg-[#FFF9F2]/70 p-8 text-center">
      <div>
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
          <Search size={20} />
        </div>
        <p className="font-display text-xl font-extrabold text-[#2B2118]">{label}</p>
        <p className="mt-1 text-sm font-semibold text-[#8A7563]">Thử đổi từ khóa tìm kiếm hoặc chuyển tab khác.</p>
      </div>
    </div>
  );
}

function AdminShell() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const dashboard = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api<AdminDashboardDto>("/admin/dashboard"),
  });
  const system = useQuery({
    queryKey: ["admin", "system"],
    queryFn: () => api<AdminSystemConfigDto>("/admin/system"),
    enabled: tab === "system",
  });
  const users = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => api<AdminListDto<AdminUserDto>>(`/admin/users${queryString({ page: 1, perPage: 20, q: search })}`),
    enabled: tab === "users",
  });
  const trips = useQuery({
    queryKey: ["admin", "trips", search],
    queryFn: () => api<AdminListDto<AdminTripDto>>(`/admin/trips${queryString({ page: 1, perPage: 20, q: search })}`),
    enabled: tab === "trips",
  });
  const payments = useQuery({
    queryKey: ["admin", "payments", search],
    queryFn: () => api<AdminListDto<AdminPaymentIntentDto>>(`/admin/payments${queryString({ page: 1, perPage: 20, q: search })}`),
    enabled: tab === "payments",
  });
  const guides = useQuery({
    queryKey: ["admin", "guides", search],
    queryFn: () => api<AdminListDto<AdminGuideDto>>(`/admin/guides${queryString({ page: 1, perPage: 20, q: search })}`),
    enabled: tab === "guides",
  });
  const affiliate = useQuery({
    queryKey: ["admin", "affiliate", search],
    queryFn: () => api<AdminListDto<AdminAffiliateClickDto>>(`/admin/affiliate-clicks${queryString({ page: 1, perPage: 20, q: search })}`),
    enabled: tab === "affiliate",
  });
  const audit = useQuery({
    queryKey: ["admin", "audit", search],
    queryFn: () => api<AdminListDto<AuditLogDto>>(`/admin/audit-logs${queryString({ page: 1, perPage: 20, q: search })}`),
    enabled: tab === "audit",
  });

  const action = useMutation({
    mutationFn: ({ path, body, method = "PATCH" }: { path: string; body?: unknown; method?: "PATCH" | "POST" }) =>
      api(path, { method, body: body === undefined ? undefined : JSON.stringify(body) }),
    onSuccess: async () => {
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Không thực hiện được thao tác admin");
    },
  });

  const metrics = useMemo(
    () => [
      { label: "Users", value: dashboard.data?.totalUsers ?? 0, sub: `${dashboard.data?.proUsers ?? 0} PRO accounts`, icon: Users, tone: "ink" },
      { label: "Trips", value: dashboard.data?.totalTrips ?? 0, sub: `${dashboard.data?.publicTrips ?? 0} public trips`, icon: Compass, tone: "paper" },
      { label: "Revenue", value: money(dashboard.data?.paidRevenue ?? 0), sub: `${dashboard.data?.pendingPayments ?? 0} pending`, icon: CreditCard, tone: "accent" },
      { label: "Growth", value: dashboard.data?.affiliateClicks ?? 0, sub: `${dashboard.data?.guidePurchases ?? 0} guide buys`, icon: Activity, tone: "paper" },
    ],
    [dashboard.data],
  );

  const activeTab = tabs.find((item) => item.id === tab) ?? tabs[0];

  if (user?.role !== "ADMIN") {
    return (
      <main className="admin-canvas flex min-h-dvh items-center justify-center px-4">
        <section className="paper-surface w-full max-w-lg rounded-[28px] border border-[#F0DFCD] p-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#2B2118] text-white">
            <Lock size={22} />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#2B2118]">Không có quyền admin</h1>
          <p className="mt-2 text-sm font-semibold text-[#8A7563]">Tài khoản hiện tại chưa được cấp vai trò quản trị hệ thống.</p>
          <Button variant="secondary" onClick={logout} className="mt-6">Đăng xuất</Button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-canvas min-h-dvh text-[#2B2118]">
      <div className="grid min-h-dvh lg:grid-cols-[286px_minmax(0,1fr)]">
        <aside className="dark-surface sticky top-0 z-20 flex flex-col border-b border-white/10 px-4 py-4 text-white lg:h-dvh lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center">
            <Logo imgClassName="h-11 brightness-0 invert" />
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    setError("");
                  }}
                  className={cx(
                    "focusable-ring flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-extrabold transition duration-200 lg:w-full",
                    active
                      ? "bg-white text-[#2B2118] shadow-[0_12px_24px_rgba(0,0,0,0.14)]"
                      : "text-white/62 hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  <Icon size={17} className={active ? "text-brand-700" : ""} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto hidden rounded-[22px] border border-white/10 bg-white/[0.06] p-4 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#2B2118]">
                <UserRound size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white/48">Quản trị viên</p>
                <p className="mt-0.5 truncate text-sm font-extrabold text-white">{user.email}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={logout} className="mt-3 w-full bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/16">
              <LogOut size={14} />
              Đăng xuất
            </Button>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
          <header className="paper-surface overflow-hidden rounded-[30px] border border-[#F0DFCD] p-5 sm:p-6">
            <div className="route-thread mb-5 h-4 w-full opacity-70" />
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-extrabold text-brand-800">{activeTab.label}</p>
              <h1 className="text-balance font-display text-4xl font-extrabold leading-[0.98] text-[#2B2118] sm:text-5xl">
                Quản lý vận hành
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#6E5A49]">
                Theo dõi tăng trưởng, kiểm tra nội dung và xử lý thao tác quan trọng.
              </p>
            </div>
            {tab !== "system" && tab !== "dashboard" && (
              <label className="relative block w-full max-w-md">
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7563]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm email, trip, guide, mã thanh toán..."
                  className="focusable-ring w-full rounded-full border border-[#E8D6C3] bg-white py-3 pl-10 pr-4 text-sm font-bold outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            )}
            </div>
          </header>

          {tab !== "dashboard" && (
          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const cardClass =
                metric.tone === "ink"
                  ? "bg-[#2B2118] text-white border-[#2B2118]"
                  : metric.tone === "accent"
                    ? "bg-[#FFF0E8] text-[#2B2118] border-brand-200"
                    : "paper-surface text-[#2B2118] border-[#F0DFCD]";
              return (
                <div key={metric.label} className={`rounded-[24px] border p-4 ${cardClass}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-xs font-extrabold ${metric.tone === "ink" ? "text-white/58" : "text-[#8A7563]"}`}>{metric.label}</p>
                    <div className={`flex size-9 items-center justify-center rounded-2xl ${metric.tone === "ink" ? "bg-white/10 text-brand-200" : "bg-white text-brand-700 shadow-sm"}`}>
                      <Icon size={17} />
                    </div>
                  </div>
                  <p className={`mt-3 text-3xl font-extrabold ${metric.tone === "ink" ? "text-white" : "text-[#2B2118]"}`}>{metric.value}</p>
                  <p className={`mt-1 text-xs font-bold ${metric.tone === "ink" ? "text-white/52" : "text-[#8A7563]"}`}>{metric.sub}</p>
                </div>
              );
            })}
          </section>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <section className="paper-surface mt-5 min-w-0 overflow-hidden rounded-[30px] border border-[#F0DFCD]">
            <TabPanel
              tab={tab}
              dashboard={dashboard.data}
              metrics={metrics}
              users={users.data}
              trips={trips.data}
              payments={payments.data}
              guides={guides.data}
              affiliate={affiliate.data}
              system={system.data}
              audit={audit.data}
              loading={
                users.isLoading ||
                (tab === "dashboard" && dashboard.isLoading) ||
                trips.isLoading ||
                payments.isLoading ||
                guides.isLoading ||
                affiliate.isLoading ||
                system.isLoading ||
                audit.isLoading
              }
              busy={action.isPending}
              onAction={(path, body, method) => action.mutate({ path, body, method })}
            />
          </section>
        </section>
      </div>
    </main>
  );
}

function TabPanel({
  tab,
  dashboard,
  metrics,
  users,
  trips,
  payments,
  guides,
  affiliate,
  system,
  audit,
  loading,
  busy,
  onAction,
}: {
  tab: AdminTab;
  dashboard?: AdminDashboardDto;
  metrics: Array<{ label: string; value: string | number; sub: string; icon: typeof Users; tone: string }>;
  users?: AdminListDto<AdminUserDto>;
  trips?: AdminListDto<AdminTripDto>;
  payments?: AdminListDto<AdminPaymentIntentDto>;
  guides?: AdminListDto<AdminGuideDto>;
  affiliate?: AdminListDto<AdminAffiliateClickDto>;
  system?: AdminSystemConfigDto;
  audit?: AdminListDto<AuditLogDto>;
  loading: boolean;
  busy: boolean;
  onAction: (path: string, body?: unknown, method?: "PATCH" | "POST") => void;
}) {
  if (loading) {
    return <div className="flex min-h-72 items-center justify-center"><Spinner className="size-8" /></div>;
  }

  if (tab === "dashboard") return <DashboardPanel data={dashboard} metrics={metrics} />;
  if (tab === "users") return <UsersTable data={users} busy={busy} onAction={onAction} />;
  if (tab === "trips") return <TripsTable data={trips} busy={busy} onAction={onAction} />;
  if (tab === "payments") return <PaymentsTable data={payments} busy={busy} onAction={onAction} />;
  if (tab === "guides") return <GuidesTable data={guides} busy={busy} onAction={onAction} />;
  if (tab === "affiliate") return <AffiliateTable data={affiliate} />;
  if (tab === "system") return <SystemPanel data={system} />;
  return <AuditTable data={audit} />;
}

function DashboardPanel({
  data,
  metrics,
}: {
  data?: AdminDashboardDto;
  metrics: Array<{ label: string; value: string | number; sub: string; icon: typeof Users; tone: string }>;
}) {
  if (!data) return <EmptyState label="Không tải được dashboard" />;
  const proRate = percent(data.proUsers, data.totalUsers);
  const publicTripRate = percent(data.publicTrips, data.totalTrips);
  const monetization = Math.min(100, Math.max(8, Math.round(data.paidRevenue / 10000)));
  const activityBars = [
    { label: "Users", value: data.totalUsers, height: Math.max(18, percent(data.totalUsers, Math.max(data.totalUsers, data.totalTrips, data.affiliateClicks, 1))) },
    { label: "Trips", value: data.totalTrips, height: Math.max(18, percent(data.totalTrips, Math.max(data.totalUsers, data.totalTrips, data.affiliateClicks, 1))) },
    { label: "Clicks", value: data.affiliateClicks, height: Math.max(18, percent(data.affiliateClicks, Math.max(data.totalUsers, data.totalTrips, data.affiliateClicks, 1))) },
    { label: "Guides", value: data.guidePurchases, height: Math.max(18, percent(data.guidePurchases, Math.max(data.totalUsers, data.totalTrips, data.affiliateClicks, 1))) },
  ];
  const health = [
    { label: "PRO", value: `${proRate}%`, width: Math.max(8, proRate) },
    { label: "Public trips", value: `${publicTripRate}%`, width: Math.max(8, publicTripRate) },
    { label: "Revenue", value: money(data.paidRevenue), width: monetization },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={cx(
                "metric-pop rounded-[24px] border p-4",
                metric.tone === "ink" && "border-[#2B2118] bg-[#2B2118] text-white",
                metric.tone === "accent" && "border-brand-200 bg-[#FFF0E8] text-[#2B2118]",
                metric.tone === "paper" && "chart-card border-[#F0DFCD] text-[#2B2118]",
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={cx("text-xs font-extrabold", metric.tone === "ink" ? "text-white/58" : "text-[#8A7563]")}>{metric.label}</p>
                <div className={cx("flex size-9 items-center justify-center rounded-2xl", metric.tone === "ink" ? "bg-white/10 text-brand-200" : "bg-white text-brand-700 shadow-sm")}>
                  <Icon size={17} />
                </div>
              </div>
              <p className={cx("mt-3 text-3xl font-extrabold", metric.tone === "ink" ? "text-white" : "text-[#2B2118]")}>{metric.value}</p>
              <p className={cx("mt-1 text-xs font-bold", metric.tone === "ink" ? "text-white/52" : "text-[#8A7563]")}>{metric.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="chart-card rounded-[28px] border border-[#F0DFCD] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold leading-none text-[#2B2118]">Tăng trưởng vận hành</h2>
              <p className="mt-1 text-sm font-semibold text-[#8A7563]">Users, trips, affiliate và guide purchases.</p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF3EB] text-brand-700">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="mt-8 flex h-64 items-end gap-4 rounded-[24px] bg-[#FFF9F2] px-5 py-5">
            {activityBars.map((item, index) => (
              <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-3">
                <div className="flex flex-1 items-end">
                  <div
                    className="chart-bar w-full rounded-t-2xl bg-gradient-to-t from-brand-700 to-brand-400 shadow-[0_12px_30px_rgba(255,107,44,0.18)]"
                    style={{ height: `${item.height}%`, animationDelay: `${index * 110}ms` }}
                  />
                </div>
                <div>
                  <p className="text-center text-sm font-extrabold text-[#2B2118]">{item.value}</p>
                  <p className="text-center text-[11px] font-bold text-[#8A7563]">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dark-surface rounded-[28px] border border-white/10 p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold leading-none">Sức khỏe nền tảng</h2>
              <p className="mt-1 text-sm font-semibold text-white/56">Tỉ lệ và doanh thu trọng yếu.</p>
            </div>
            <Activity size={21} className="text-brand-200" />
          </div>

          <svg className="mt-6 h-32 w-full overflow-visible" viewBox="0 0 320 120" role="img" aria-label="Platform health line chart">
            <path d="M10 88 C55 42 86 72 120 45 C156 17 184 84 222 52 C260 20 284 34 310 18" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="14" strokeLinecap="round" />
            <path className="pulse-line" d="M10 88 C55 42 86 72 120 45 C156 17 184 84 222 52 C260 20 284 34 310 18" fill="none" stroke="#FF6B2C" strokeWidth="5" strokeLinecap="round" />
            {[10, 120, 222, 310].map((cxValue) => (
              <circle key={cxValue} cx={cxValue} cy={cxValue === 10 ? 88 : cxValue === 120 ? 45 : cxValue === 222 ? 52 : 18} r="5" fill="#FFF3EB" />
            ))}
          </svg>

          <div className="mt-4 space-y-4">
            {health.map((item, index) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs font-extrabold">
                  <span className="text-white/64">{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="chart-bar h-full rounded-full bg-brand-500"
                    style={{ width: `${item.width}%`, animationDelay: `${index * 130}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function TableWrap({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col gap-2 border-b border-[#F0DFCD] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="font-display text-2xl font-extrabold leading-none text-[#2B2118]">{title}</h2>
          <p className="mt-1 text-xs font-semibold text-[#8A7563]">Dữ liệu mới nhất từ API vận hành.</p>
        </div>
        <div className="self-start">
          <StatusBadge tone="hot">{count ?? 0} records</StatusBadge>
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </>
  );
}

function UsersTable({ data, busy, onAction }: { data?: AdminListDto<AdminUserDto>; busy: boolean; onAction: (path: string, body?: unknown, method?: "PATCH" | "POST") => void }) {
  if (!data?.items.length) return <EmptyState label="Chưa có user phù hợp" />;
  return (
    <TableWrap title="Users" count={data.total}>
      <table className="admin-table min-w-[1040px] w-full text-left text-sm">
        <thead className="bg-[#FFF6EE] text-[11px] font-extrabold uppercase text-[#8A7563]">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">AI</th>
            <th className="px-4 py-3">Content</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0DFCD]">
          {data.items.map((user) => (
            <tr key={user.id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-extrabold">{user.name}</p>
                <p className="text-xs font-bold text-[#8A7563]">{user.email}</p>
              </td>
              <td className="px-4 py-3"><StatusBadge tone={user.role === "ADMIN" ? "hot" : "neutral"}>{user.role}</StatusBadge></td>
              <td className="px-4 py-3">
                <StatusBadge tone={user.plan === "PRO" ? "good" : "neutral"}>{user.plan}</StatusBadge>
                <p className="mt-1 text-xs font-bold text-[#8A7563]">{date(user.proExpiresAt)}</p>
              </td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">
                {user.aiGenerationsCount} lượt<br />{date(user.aiGenerationsDate)}
              </td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">
                {user.tripCount} trips · {user.guideCount} guides · {user.purchaseCount} buys
              </td>
              <td className="px-4 py-3 text-xs font-bold text-[#8A7563]">{date(user.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <IconAction disabled={busy} label="Set PRO" onClick={() => onAction(`/admin/users/${user.id}/plan`, { plan: "PRO", proExpiresAt: new Date(Date.now() + 30 * 86400_000).toISOString() })}><Sparkles size={15} /></IconAction>
                  <IconAction disabled={busy} label="Set FREE" onClick={() => onAction(`/admin/users/${user.id}/plan`, { plan: "FREE" })}><ShieldCheck size={15} /></IconAction>
                  <IconAction disabled={busy} label="Reset AI" onClick={() => onAction(`/admin/users/${user.id}/reset-ai-quota`, undefined, "POST")}><Bot size={15} /></IconAction>
                  <IconAction disabled={busy} label="Revoke session" danger onClick={() => onAction(`/admin/users/${user.id}/revoke-session`, undefined, "POST")}><RefreshCcw size={15} /></IconAction>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

function TripsTable({ data, busy, onAction }: { data?: AdminListDto<AdminTripDto>; busy: boolean; onAction: (path: string, body?: unknown) => void }) {
  if (!data?.items.length) return <EmptyState label="Chưa có trip phù hợp" />;
  return (
    <TableWrap title="Trips" count={data.total}>
      <table className="admin-table min-w-[1040px] w-full text-left text-sm">
        <thead className="bg-[#FFF6EE] text-[11px] font-extrabold uppercase text-[#8A7563]">
          <tr>
            <th className="px-4 py-3">Trip</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Visibility</th>
            <th className="px-4 py-3">Mode</th>
            <th className="px-4 py-3">Stats</th>
            <th className="px-4 py-3">Budget</th>
            <th className="px-4 py-3 text-right">Moderation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0DFCD]">
          {data.items.map((trip) => (
            <tr key={trip.id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-extrabold">{trip.title}</p>
                <p className="text-xs font-bold text-[#8A7563]">{trip.destination} · {date(trip.startDate)} - {date(trip.endDate)}</p>
              </td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{trip.owner.name}<br />{trip.owner.email}</td>
              <td className="px-4 py-3"><StatusBadge tone={trip.visibility === "PUBLIC" ? "good" : trip.visibility === "LINK" ? "warn" : "neutral"}>{trip.visibility}</StatusBadge></td>
              <td className="px-4 py-3"><StatusBadge tone={trip.distributionMode === "SHOP_PAID" ? "hot" : "neutral"}>{trip.distributionMode}</StatusBadge></td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{trip.dayCount} days · {trip.placeCount} places · {trip.memberCount} members<br />{trip.expenseCount} expenses · {trip.attachmentCount} files · {trip.cloneCount} clones</td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{trip.budgetAmount ? money(trip.budgetAmount, trip.budgetCurrency) : "-"}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {(["PRIVATE", "LINK", "PUBLIC"] as const).map((visibility) => (
                    <button
                      key={visibility}
                      disabled={busy || trip.visibility === visibility}
                      onClick={() => onAction(`/admin/trips/${trip.id}/visibility`, { visibility })}
                      className="focusable-ring rounded-full border border-[#E8D6C3] bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-[#5C534A] transition hover:border-brand-300 hover:bg-[#FFF3EB] disabled:opacity-45"
                    >
                      {visibility}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

function PaymentsTable({ data, busy, onAction }: { data?: AdminListDto<AdminPaymentIntentDto>; busy: boolean; onAction: (path: string, body?: unknown) => void }) {
  if (!data?.items.length) return <EmptyState label="Chưa có payment intent phù hợp" />;
  return (
    <TableWrap title="Billing" count={data.total}>
      <table className="admin-table min-w-[980px] w-full text-left text-sm">
        <thead className="bg-[#FFF6EE] text-[11px] font-extrabold uppercase text-[#8A7563]">
          <tr>
            <th className="px-4 py-3">Checkout</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Paid</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0DFCD]">
          {data.items.map((intent) => (
            <tr key={intent.id} className="align-top">
              <td className="px-4 py-3"><p className="font-extrabold">{intent.checkoutCode}</p><p className="text-xs font-bold text-[#8A7563]">{intent.billingPeriod} · {intent.durationDays} ngày</p></td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{intent.user.name}<br />{intent.user.email}</td>
              <td className="px-4 py-3 font-extrabold">{money(intent.amount, intent.currency)}</td>
              <td className="px-4 py-3"><StatusBadge tone={intent.status === "PAID" ? "good" : intent.status === "PENDING" ? "warn" : "bad"}>{intent.status}</StatusBadge></td>
              <td className="px-4 py-3 text-xs font-bold text-[#8A7563]">{date(intent.paidAt)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {(["PAID", "CANCELED", "EXPIRED"] as const).map((status) => (
                    <button key={status} disabled={busy || intent.status === status} onClick={() => onAction(`/admin/payments/${intent.id}/status`, { status })} className="focusable-ring rounded-full border border-[#E8D6C3] bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-[#5C534A] transition hover:border-brand-300 hover:bg-[#FFF3EB] disabled:opacity-45">{status}</button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

function GuidesTable({ data, busy, onAction }: { data?: AdminListDto<AdminGuideDto>; busy: boolean; onAction: (path: string, body?: unknown) => void }) {
  if (!data?.items.length) return <EmptyState label="Chưa có guide phù hợp" />;
  return (
    <TableWrap title="Creator Guides" count={data.total}>
      <table className="admin-table min-w-[980px] w-full text-left text-sm">
        <thead className="bg-[#FFF6EE] text-[11px] font-extrabold uppercase text-[#8A7563]">
          <tr>
            <th className="px-4 py-3">Guide</th>
            <th className="px-4 py-3">Creator</th>
            <th className="px-4 py-3">Trip</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Moderation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0DFCD]">
          {data.items.map((guide) => (
            <tr key={guide.id} className="align-top">
              <td className="px-4 py-3"><p className="font-extrabold">{guide.title}</p><p className="line-clamp-2 max-w-md text-xs font-bold text-[#8A7563]">{guide.description || "-"}</p></td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{guide.creator.name}<br />{guide.creator.email}</td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{guide.trip.title}<br />{guide.trip.destination} · {guide.trip.visibility}</td>
              <td className="px-4 py-3 font-extrabold">{money(guide.price, guide.currency)}<p className="text-xs font-bold text-[#8A7563]">{guide.purchaseCount} buys</p></td>
              <td className="px-4 py-3"><StatusBadge tone={guide.published ? "good" : "bad"}>{guide.published ? "PUBLISHED" : "HIDDEN"}</StatusBadge></td>
              <td className="px-4 py-3 text-right">
                <Button variant={guide.published ? "danger" : "secondary"} disabled={busy} onClick={() => onAction(`/admin/guides/${guide.id}/moderation`, { published: !guide.published })} className="px-3 py-1.5 text-xs">
                  {guide.published ? "Unpublish" : "Publish"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

function AffiliateTable({ data }: { data?: AdminListDto<AdminAffiliateClickDto> }) {
  if (!data?.items.length) return <EmptyState label="Chưa có affiliate click phù hợp" />;
  return (
    <TableWrap title="Affiliate Clicks" count={data.total}>
      <table className="admin-table min-w-[760px] w-full text-left text-sm">
        <thead className="bg-[#FFF6EE] text-[11px] font-extrabold uppercase text-[#8A7563]">
          <tr>
            <th className="px-4 py-3">Partner</th>
            <th className="px-4 py-3">Trip</th>
            <th className="px-4 py-3">Place</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0DFCD]">
          {data.items.map((click) => (
            <tr key={click.id}>
              <td className="px-4 py-3"><StatusBadge tone="hot">{click.partner}</StatusBadge></td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{click.tripId}</td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{click.placeId ?? "-"}</td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{click.userId ?? "-"}</td>
              <td className="px-4 py-3 text-xs font-bold text-[#8A7563]">{date(click.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

function SystemPanel({ data }: { data?: AdminSystemConfigDto }) {
  if (!data) return <EmptyState label="Không tải được system config" />;
  const rows = [
    ["Geo provider", data.geoProvider, data.goongConfigured],
    ["OpenAI", data.openAiModel, data.openAiConfigured],
    ["SePay", "Webhook / bank config", data.sepayConfigured],
    ["Inbound import", "Email webhook secret", data.importEmailConfigured],
    ["Booking", "Affiliate ID", data.affiliatePartners.booking],
    ["Agoda", "Affiliate ID", data.affiliatePartners.agoda],
    ["Viator", "Affiliate ID", data.affiliatePartners.viator],
    ["Klook", "Affiliate ID", data.affiliatePartners.klook],
    ["Traveloka", "Affiliate ID", data.affiliatePartners.traveloka],
  ] as const;
  return (
    <TableWrap title="System Config" count={rows.length}>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(([label, detail, ok]) => (
          <div key={label} className="rounded-[22px] border border-[#E8D6C3] bg-[#FFF9F2] p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
            <div className="flex items-center justify-between gap-3">
              <p className="font-extrabold">{label}</p>
              <StatusBadge tone={ok ? "good" : "warn"}>{ok ? "CONFIGURED" : "MISSING"}</StatusBadge>
            </div>
            <p className="mt-2 text-xs font-bold text-[#8A7563]">{detail}</p>
          </div>
        ))}
      </div>
    </TableWrap>
  );
}

function AuditTable({ data }: { data?: AdminListDto<AuditLogDto> }) {
  if (!data?.items.length) return <EmptyState label="Chưa có audit log phù hợp" />;
  return (
    <TableWrap title="Audit Logs" count={data.total}>
      <table className="admin-table min-w-[900px] w-full text-left text-sm">
        <thead className="bg-[#FFF6EE] text-[11px] font-extrabold uppercase text-[#8A7563]">
          <tr>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Target</th>
            <th className="px-4 py-3">Metadata</th>
            <th className="px-4 py-3">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0DFCD]">
          {data.items.map((log) => (
            <tr key={log.id} className="align-top">
              <td className="px-4 py-3"><StatusBadge tone="hot">{log.action}</StatusBadge></td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{log.actor?.email ?? "-"}</td>
              <td className="px-4 py-3 text-xs font-bold text-[#5C534A]">{log.targetType}<br />{log.targetId ?? "-"}</td>
              <td className="px-4 py-3"><code className="block max-w-md overflow-hidden text-ellipsis whitespace-nowrap rounded-lg bg-[#FFF6EE] px-2 py-1 text-[11px] font-bold text-[#5C534A]">{JSON.stringify(log.metadata ?? {})}</code></td>
              <td className="px-4 py-3 text-xs font-bold text-[#8A7563]">{date(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

function IconAction({ children, label, danger, disabled, onClick }: { children: React.ReactNode; label: string; danger?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`focusable-ring inline-flex size-8 items-center justify-center rounded-full border transition disabled:opacity-45 ${
        danger ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" : "border-[#E8D6C3] bg-white text-[#8A7563] hover:border-brand-300 hover:bg-[#FFF3EB] hover:text-brand-800"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth>
      <AdminShell />
    </RequireAuth>
  );
}
