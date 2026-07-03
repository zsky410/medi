"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { formatShortStayDate } from "@/lib/format";
import { DateInput } from "@/components/date-input";

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const fieldBox =
  "w-full rounded-lg border border-transparent bg-white/80 px-3 py-2.5 text-sm font-semibold text-[#2B2118] transition-colors";

export function InlineLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-[#8A7563]">
      {children}
    </p>
  );
}

export function InlineTextField({
  label,
  value,
  placeholder,
  onSave,
  canEdit,
  multiline = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onSave: (value: string) => void;
  canEdit: boolean;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  }

  if (!canEdit) {
    return (
      <div>
        <InlineLabel>{label}</InlineLabel>
        <div className={cx(fieldBox, "bg-[#EFEFEF] cursor-default")}>
          {value || <span className="text-[#B5A89A]">{placeholder}</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {label ? <InlineLabel>{label}</InlineLabel> : null}
      {editing ? (
        multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={cx(fieldBox, "border-[#E8DDD3] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none")}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={cx(fieldBox, "border-[#E8DDD3] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100")}
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={cx(
            fieldBox,
            "text-left cursor-pointer hover:border-[#E8DDD3] hover:bg-white",
            !value && "text-[#B5A89A] font-semibold",
          )}
        >
          {value || placeholder}
        </button>
      )}
    </div>
  );
}

export function InlineDateField({
  label,
  value,
  placeholder,
  onSave,
  canEdit,
  min,
}: {
  label: string;
  value: string;
  placeholder: string;
  onSave: (value: string) => void;
  canEdit: boolean;
  min?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!canEdit) {
    return (
      <div>
        <InlineLabel>{label}</InlineLabel>
        <div className={cx(fieldBox, "bg-[#EFEFEF] cursor-default")}>
          {value ? formatShortStayDate(value) : <span className="text-[#B5A89A]">{placeholder}</span>}
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div>
        <InlineLabel>{label}</InlineLabel>
        <div className="rounded-lg border border-[#E8DDD3] bg-white">
          <DateInput
            value={value}
            min={min}
            onChange={(v) => {
              onSave(v);
              setEditing(false);
            }}
            className="border-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {label ? <InlineLabel>{label}</InlineLabel> : null}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cx(
          fieldBox,
          "text-left cursor-pointer hover:border-[#E8DDD3] hover:bg-white",
          !value && "text-[#B5A89A]",
        )}
      >
        {value ? formatShortStayDate(value) : placeholder}
      </button>
    </div>
  );
}

export function InlineAmountField({
  label,
  value,
  onSave,
  canEdit,
}: {
  label: string;
  value: number | undefined;
  onSave: (value: number | undefined) => void;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value?.toString() ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value?.toString() ?? "");
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    const parsed = Number(draft.replace(/\D/g, ""));
    const next = parsed > 0 ? parsed : undefined;
    if (next !== value) onSave(next);
  }

  const display = value ? value.toLocaleString("vi-VN") : "";

  if (!canEdit) {
    return (
      <div>
        <InlineLabel>{label}</InlineLabel>
        <div className={cx(fieldBox, "bg-[#EFEFEF] cursor-default flex items-center gap-2")}>
          <span className="text-[#8A7563]">₫</span>
          {display || <span className="text-[#B5A89A]">0</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {label ? <InlineLabel>{label}</InlineLabel> : null}
      {editing ? (
        <div className={cx(fieldBox, "flex items-center gap-2 border-[#E8DDD3] focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100")}>
          <span className="text-sm font-bold text-[#8A7563]">₫</span>
          <input
            ref={inputRef}
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                setDraft(value?.toString() ?? "");
                setEditing(false);
              }
            }}
            placeholder="870000"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={cx(fieldBox, "flex items-center gap-2 text-left cursor-pointer hover:border-[#E8DDD3] hover:bg-white")}
        >
          <span className="text-sm font-bold text-[#8A7563]">₫</span>
          <span className={!display ? "text-[#B5A89A]" : ""}>{display || "Nhấn để nhập chi phí"}</span>
        </button>
      )}
    </div>
  );
}
