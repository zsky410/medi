import Link from "next/link";

export function Logo({ className = "", imgClassName = "" }: { className?: string; imgClassName?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center transition-transform hover:scale-[1.02] active:scale-95 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Mê Đi Logo"
        className={`h-8 sm:h-9 md:h-10 w-auto object-contain ${imgClassName}`}
      />
    </Link>
  );
}
