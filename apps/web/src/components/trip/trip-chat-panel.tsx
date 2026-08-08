"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, X } from "lucide-react";
import type { TripMessageDto } from "@medi/types";
import { ApiError, api } from "@/lib/api";
import {
  appendTripMessage,
  getTripChatExpiryDelay,
  isFirstMessageInSenderGroup,
  pruneExpiredTripMessages,
  tripMessagesQueryKey,
} from "@/lib/trip-chat";
import { Avatar, ErrorText, Spinner } from "@/components/ui";

export function TripChatPanel({
  tripId,
  currentUserId,
  hasNewMessage = false,
  onSeen,
}: {
  tripId: string;
  currentUserId?: string;
  hasNewMessage?: boolean;
  onSeen?: () => void;
}) {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const queryKey = tripMessagesQueryKey(tripId);
  const { data: messages = [], isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const newestMessages = await api<TripMessageDto[]>(`/trips/${tripId}/messages?limit=50`);
      return pruneExpiredTripMessages(newestMessages.reverse());
    },
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    onSeen?.();
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [onSeen, open, messages.length]);

  useEffect(() => {
    const delay = getTripChatExpiryDelay(messages);
    if (delay == null) return;
    const timeoutId = window.setTimeout(() => {
      queryClient.setQueryData<TripMessageDto[]>(queryKey, []);
    }, delay);
    return () => window.clearTimeout(timeoutId);
  }, [messages, queryClient, queryKey]);

  const sendMutation = useMutation({
    mutationFn: (messageBody: string) =>
      api<TripMessageDto>(`/trips/${tripId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: messageBody }),
      }),
    onSuccess: (message) => {
      queryClient.setQueryData<TripMessageDto[]>(queryKey, (current = []) => appendTripMessage(current, message));
      setBody("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Không gửi được tin nhắn"),
  });

  const trimmedBody = body.trim();
  const send = () => {
    if (!trimmedBody || sendMutation.isPending) return;
    sendMutation.mutate(trimmedBody);
  };

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex justify-end sm:inset-x-auto sm:right-4">
      {open ? (
        <section className="pointer-events-auto flex max-h-[min(440px,calc(100%-1.5rem))] w-full max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[#F3E3D3] bg-white shadow-2xl sm:w-[360px]">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#F3E3D3] px-4 py-3">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-display font-extrabold text-[#2B2118]">Chat nhóm</h2>
              <p className="text-xs font-semibold text-[#8A7563]">Trao đổi nhanh trong chuyến đi</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#8A7563] hover:bg-[#FFF3EB] hover:text-[#2B2118]"
              aria-label="Đóng chat"
            >
              <X size={17} aria-hidden />
            </button>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#FFF9F2] px-4 py-3">
            {isFetching && messages.length === 0 ? (
              <div className="flex h-28 items-center justify-center">
                <Spinner />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-28 items-center justify-center text-center text-sm font-semibold text-[#8A7563]">
                Chưa có tin nhắn nào.
              </div>
            ) : (
              messages.map((message, index) => {
                const mine = message.senderId === currentUserId;
                const firstInGroup = isFirstMessageInSenderGroup(messages, index);
                return (
                  <div key={message.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"} ${firstInGroup ? "mt-2" : "mt-0.5"}`}>
                    {!mine && (
                      firstInGroup ? (
                        <Avatar name={message.sender.name} avatarUrl={message.sender.avatarUrl} size={28} />
                      ) : (
                        <span className="w-7 shrink-0" aria-hidden="true" />
                      )
                    )}
                    <div className={`max-w-[78%] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      {firstInGroup && (
                        <p className="max-w-full truncate px-1 text-[11px] font-extrabold text-[#8A7563]">
                          {mine ? "Bạn" : message.sender.name}
                        </p>
                      )}
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                          mine
                            ? "rounded-br-md bg-brand-500 text-white"
                            : "rounded-bl-md border border-[#F3E3D3] bg-white text-[#2B2118]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="shrink-0 border-t border-[#F3E3D3] bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                maxLength={1000}
                rows={1}
                className="max-h-24 min-h-10 flex-1 resize-none rounded-xl border border-[#F3E3D3] bg-white px-3 py-2 text-sm text-[#2B2118] outline-none transition-all placeholder:text-[#8A7563]/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Nhắn cho nhóm..."
              />
              <button
                type="button"
                onClick={send}
                disabled={!trimmedBody || sendMutation.isPending}
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand-500 text-white shadow-sm transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
                aria-label="Gửi tin nhắn"
              >
                {sendMutation.isPending ? <Spinner className="size-4 border-white/50 border-t-white" /> : <Send size={17} aria-hidden />}
              </button>
            </div>
            <ErrorText>{error}</ErrorText>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            onSeen?.();
          }}
          className={`pointer-events-auto relative flex size-12 cursor-pointer items-center justify-center rounded-full bg-brand-500 text-white shadow-xl ring-4 ring-white/85 transition-all hover:bg-brand-700 hover:shadow-2xl ${hasNewMessage ? "animate-chat-notify" : ""}`}
          aria-label="Mở chat nhóm"
          title="Chat nhóm"
        >
          <MessageCircle size={22} aria-hidden />
          {hasNewMessage && (
            <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-sun-500" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
