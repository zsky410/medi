export function Logo({ className = "", imgClassName = "" }: { className?: string; imgClassName?: string }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Mê Đi Logo" className={`h-9 w-auto object-contain ${imgClassName}`} />
    </div>
  );
}
