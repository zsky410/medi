"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TripDetailDto, TripMemberDto } from "@medi/types";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, Button, ErrorText, Input, Modal } from "@/components/ui";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Chủ chuyến đi",
  EDITOR: "Chỉnh sửa",
  VIEWER: "Chỉ xem",
};

export function MembersModal({
  trip,
  open,
  onClose,
}: {
  trip: TripDetailDto;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const isOwner = trip.myRole === "OWNER";
  const canEdit = trip.myRole !== "VIEWER";
  const inviteLink =
    typeof window !== "undefined" && trip.inviteCode
      ? `${window.location.origin}/join/${trip.inviteCode}`
      : "";

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });

  const inviteMutation = useMutation({
    mutationFn: () =>
      api<TripMemberDto[]>(`/trips/${trip.id}/members`, {
        method: "POST",
        body: JSON.stringify({ email, role: "EDITOR" }),
      }),
    onSuccess: () => {
      setEmail("");
      setError("");
      invalidate();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Không mời được"),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api(`/trips/${trip.id}/members/${userId}`, { method: "PATCH", body: JSON.stringify({ role }) }),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      api(`/trips/${trip.id}/members/${userId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  function onInvite(e: FormEvent) {
    e.preventDefault();
    inviteMutation.mutate();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Thành viên chuyến đi">
      <div className="space-y-4">
        {canEdit && (
          <>
            <form onSubmit={onInvite} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email người bạn muốn mời"
                required
              />
              <Button type="submit" disabled={inviteMutation.isPending}>
                Mời
              </Button>
            </form>
            <ErrorText>{error}</ErrorText>
            {inviteLink && (
              <div className="flex items-center gap-2 rounded-lg bg-stone-100 p-2">
                <span className="min-w-0 flex-1 truncate text-xs text-stone-600">{inviteLink}</span>
                <Button variant="secondary" onClick={copyLink} className="shrink-0 px-3 py-1 text-xs">
                  {copied ? "Đã sao chép ✓" : "Sao chép link"}
                </Button>
              </div>
            )}
          </>
        )}

        <ul className="space-y-2">
          {trip.members.map((m) => (
            <li key={m.userId} className="flex items-center gap-3">
              <Avatar name={m.user.name} avatarUrl={m.user.avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-800">
                  {m.user.name}
                  {m.userId === user?.id && <span className="text-stone-400"> (bạn)</span>}
                </p>
                <p className="truncate text-xs text-stone-500">{m.user.email}</p>
              </div>
              {isOwner && m.role !== "OWNER" ? (
                <select
                  value={m.role}
                  onChange={(e) => roleMutation.mutate({ userId: m.userId, role: e.target.value })}
                  className="rounded-lg border border-stone-300 px-2 py-1 text-xs"
                >
                  <option value="EDITOR">Chỉnh sửa</option>
                  <option value="VIEWER">Chỉ xem</option>
                </select>
              ) : (
                <span className="text-xs font-medium text-stone-500">{ROLE_LABELS[m.role]}</span>
              )}
              {(isOwner || m.userId === user?.id) && m.role !== "OWNER" && (
                <button
                  onClick={() => removeMutation.mutate(m.userId)}
                  className="rounded p-1 text-xs text-stone-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Xoá thành viên"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
