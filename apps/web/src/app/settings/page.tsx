"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { SubscriptionDto, UpdateProfileInput, UserDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { RequireAuth } from "@/components/require-auth";
import { Avatar, Button, Card, ErrorText, Input, Label, Spinner } from "@/components/ui";

function SettingsContent() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [name, setName] = useState(user?.name ?? "");
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency ?? "VND");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [billingError, setBillingError] = useState("");

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: () => api<SubscriptionDto>("/billing/subscription"),
  });

  useEffect(() => {
    if (searchParams.get("downgraded") === "1") void refreshUser();
  }, [searchParams, refreshUser]);

  const profileMutation = useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      api<UserDto>("/auth/me", { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: async () => {
      await refreshUser();
      setProfileError("");
    },
    onError: (err) => setProfileError(err instanceof ApiError ? err.message : "Không lưu được"),
  });

  const passwordMutation = useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      api("/auth/change-password", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setPasswordError("");
    },
    onError: (err) => setPasswordError(err instanceof ApiError ? err.message : "Không đổi được mật khẩu"),
  });

  const portalMutation = useMutation({
    mutationFn: () => api<{ url: string }>("/billing/portal", { method: "POST" }),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => setBillingError(err instanceof ApiError ? err.message : "Không mở được trang quản lý"),
  });

  function onProfileSubmit(e: FormEvent) {
    e.preventDefault();
    profileMutation.mutate({ name, defaultCurrency });
  }

  function onPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    passwordMutation.mutate({ currentPassword, newPassword });
  }

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-[#FFF9F2] pb-16">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6 text-left">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-[#2B2118]">Cài đặt ⚙️</h1>
          <p className="text-sm font-semibold text-[#8A7563] mt-1">Quản lý tài khoản và gói PRO</p>
        </div>

        <Card className="p-6 border-2 border-[#F3E3D3] bg-white space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size={48} />
            <div>
              <p className="font-display font-extrabold text-[#2B2118]">{user.name}</p>
              <p className="text-xs font-semibold text-[#8A7563]">{user.email}</p>
              {user.plan === "PRO" && (
                <span className="inline-block mt-1 rounded-full bg-gradient-to-r from-brand-500 to-[#FF3D77] px-2 py-0.5 text-[10px] font-extrabold text-white">
                  PRO ✨
                </span>
              )}
            </div>
          </div>

          <form onSubmit={onProfileSubmit} className="space-y-3 pt-2 border-t border-[#F3E3D3]/50">
            <div>
              <Label htmlFor="name">Tên hiển thị</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="currency">Tiền tệ mặc định</Label>
              <select
                id="currency"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 text-sm font-bold text-[#2B2118] outline-none focus:border-brand-500"
              >
                <option value="VND">VND (₫)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <ErrorText>{profileError}</ErrorText>
            <Button type="submit" disabled={profileMutation.isPending} className="w-full">
              {profileMutation.isPending ? "Đang lưu..." : "Lưu hồ sơ"}
            </Button>
          </form>
        </Card>

        {user.authProvider === "LOCAL" && (
          <Card className="p-6 border-2 border-[#F3E3D3] bg-white space-y-3">
            <h2 className="font-display font-extrabold text-[#2B2118]">Đổi mật khẩu 🔐</h2>
            <form onSubmit={onPasswordSubmit} className="space-y-3">
              <div>
                <Label htmlFor="current">Mật khẩu hiện tại</Label>
                <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="new">Mật khẩu mới</Label>
                <Input id="new" type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <ErrorText>{passwordError}</ErrorText>
              <Button type="submit" disabled={passwordMutation.isPending} variant="secondary" className="w-full">
                {passwordMutation.isPending ? "Đang đổi..." : "Cập nhật mật khẩu"}
              </Button>
            </form>
          </Card>
        )}

        <Card className="p-6 border-2 border-[#F3E3D3] bg-white space-y-3">
          <h2 className="font-display font-extrabold text-[#2B2118]">Gói đăng ký 💳</h2>
          {subLoading ? (
            <Spinner />
          ) : (
            <>
              <p className="text-sm font-semibold text-[#8A7563]">
                Gói hiện tại: <span className="text-[#2B2118] font-bold">{subscription?.plan ?? user.plan}</span>
                {subscription?.renewsAt && (
                  <> · Gia hạn {formatDateTime(subscription.renewsAt)}</>
                )}
              </p>
              {user.plan === "PRO" ? (
                <Button
                  variant="secondary"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  className="w-full"
                >
                  {portalMutation.isPending ? "Đang mở..." : "Quản lý / Huỷ gói PRO"}
                </Button>
              ) : (
                <Button onClick={() => (window.location.href = "/pricing")} className="w-full">
                  Nâng cấp PRO ✨
                </Button>
              )}
              <ErrorText>{billingError}</ErrorText>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <SettingsContent />
      </Suspense>
    </RequireAuth>
  );
}
