"use client";

import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2B2118] text-white shadow-[0_12px_28px_rgba(43,33,24,0.18)] hover:bg-[#433326] hover:shadow-[0_16px_34px_rgba(43,33,24,0.2)] active:translate-y-px disabled:bg-[#8A7563] disabled:shadow-none disabled:translate-y-0",
  secondary:
    "bg-white text-[#2B2118] border border-[#F0DFCD] shadow-sm hover:border-brand-300 hover:bg-[#FFF3EB] active:translate-y-px",
  ghost: "text-[#6E5A49] hover:bg-[#FFF3EB] hover:text-[#2B2118] active:translate-y-px",
  danger: "bg-[#D93D31] text-white shadow-sm hover:bg-[#BD2D23] active:translate-y-px",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cx(
        "focusable-ring inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-extrabold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "w-full rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 text-sm font-bold outline-none placeholder:text-[#8A7563]/50 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={cx("mb-1.5 block text-sm font-extrabold text-[#2B2118]", htmlFor && "cursor-pointer")}>
      {children}
    </label>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-block size-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500",
        className,
      )}
    />
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="mt-2 text-sm font-semibold text-red-500">{children}</p>;
}
