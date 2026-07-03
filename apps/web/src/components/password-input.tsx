"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui";

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

/** Password field with a reliable show/hide toggle (uses onMouseDown to avoid focus steal). */
export function PasswordInput({ id, className, label, ...props }: PasswordInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={inputId}
        type={visible ? "text" : "password"}
        autoComplete={props.autoComplete ?? "current-password"}
        className={cx("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        aria-pressed={visible}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisible((v) => !v);
        }}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#8A7563] hover:text-[#2B2118] transition-colors focus:outline-none cursor-pointer select-none"
      >
        {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
