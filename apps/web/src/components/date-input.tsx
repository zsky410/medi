"use client";

import { useRef, type InputHTMLAttributes } from "react";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/format";

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: string;
  onChange: (isoDate: string) => void;
}

/** Date picker that displays dd/mm/yyyy while storing yyyy-mm-dd for the API. */
export function DateInput({ id, value, onChange, required, className, min, max, disabled }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    if (disabled) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        // showPicker requires a user gesture; focus still allows keyboard entry
      }
    }
  }

  return (
    <label
      htmlFor={id}
      onClick={(e) => {
        e.preventDefault();
        openPicker();
      }}
      className={cx(
        "relative block w-full cursor-pointer rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 pr-10 text-sm",
        !value && "text-[#8A7563]",
        value && "text-[#2B2118] font-semibold",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {value ? formatDate(value) : "dd/mm/yyyy"}
      <Calendar
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-500"
        aria-hidden
      />
      <input
        ref={inputRef}
        id={id}
        type="date"
        required={required}
        disabled={disabled}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
      />
    </label>
  );
}
