"use client";

import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, useEffect } from "react";

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-700 hover:shadow-md shadow-sm active:scale-95 disabled:bg-brand-300 disabled:scale-100",
  secondary: "bg-[#FFF3EB] text-[#2B2118] border border-[#F3E3D3] hover:bg-[#FFE1CF] active:scale-95",
  ghost: "text-[#8A7563] hover:bg-[#FFF3EB] active:scale-95",
  danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cx(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60",
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
        "w-full rounded-xl border border-[#F3E3D3] bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-[#8A7563]/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={cx("mb-1.5 block text-sm font-bold text-[#2B2118]", htmlFor && "cursor-pointer")}>
      {children}
    </label>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-2xl border border-[#F3E3D3] bg-white shadow-sm", className)}>
      {children}
    </div>
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

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** `lg` fits a compact Free vs PRO comparison. */
  size?: "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 cursor-pointer bg-[#2B2118]/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full rounded-2xl border border-[#F3E3D3] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
          size === "lg" ? "max-w-3xl max-h-[min(92dvh,880px)] overflow-y-auto" : "max-w-md"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-display font-extrabold text-[#2B2118]">{title}</h2>
          <button onClick={onClose} className="cursor-pointer shrink-0 rounded-full p-1 text-[#8A7563] hover:bg-[#FFF3EB] hover:text-[#2B2118]" aria-label="Đóng">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Avatar({ name, avatarUrl, size = 32 }: { name: string; avatarUrl?: string | null; size?: number }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={name} width={size} height={size} className="rounded-full object-cover border border-[#F3E3D3]" style={{ width: size, height: size }} />;
  }
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="flex items-center justify-center rounded-full bg-brand-200 font-display font-bold text-brand-800 border border-[#F3E3D3]"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={name}
    >
      {initials}
    </span>
  );
}
