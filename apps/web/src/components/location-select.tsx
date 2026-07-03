"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { destinationFilterTerm, fetchLocations, normalizeSearchText, searchLocations } from "@/lib/locations";

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface LocationSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
}

export function LocationSelect({
  id,
  value,
  onChange,
  required,
  placeholder = "Tìm tỉnh, thành phố hoặc điểm đến...",
  className,
  disabled,
  allowEmpty = false,
}: LocationSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  const { data: locations, isLoading, isError } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const trimmedQuery = query.trim();
  const results = useMemo(() => {
    if (!locations) return [];
    return searchLocations(locations, trimmedQuery, 12);
  }, [locations, trimmedQuery]);

  const showPopular = open && !trimmedQuery;
  const showSearch = open && trimmedQuery.length >= 1;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function select(label: string) {
    onChange(label);
    setQuery(label);
    setOpen(false);
  }

  function pickBestMatch() {
    if (!query.trim()) return;
    if (value && normalizeSearchText(value) === normalizeSearchText(query)) return;
    const match = results[0];
    if (match) select(match.label);
    else onChange(query.trim());
  }

  function clear() {
    onChange("");
    setQuery("");
    setOpen(false);
  }

  const showDropdown = Boolean(
    open &&
      !disabled &&
      !isLoading &&
      !isError &&
      (showSearch || showPopular || (allowEmpty && !trimmedQuery)),
  );

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <MapPin
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7563]"
          aria-hidden
        />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          required={required && !value}
          disabled={disabled || isLoading || isError}
          value={query}
          placeholder={
            isLoading ? "Đang tải địa điểm..." : isError ? "Không tải được danh sách" : placeholder
          }
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value && allowEmpty) onChange("");
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              pickBestMatch();
            }, 120);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              pickBestMatch();
            }
            if (e.key === "Escape") setOpen(false);
          }}
          className={cx(
            "w-full rounded-xl border border-[#F3E3D3] bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all disabled:cursor-not-allowed disabled:opacity-60",
            !query && "text-[#8A7563]",
            className,
          )}
        />
      </div>

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#F3E3D3] bg-white py-1 shadow-lg"
        >
          {allowEmpty && !trimmedQuery && (
            <li>
              <button
                type="button"
                role="option"
                className="w-full px-3.5 py-2.5 text-left text-sm text-[#8A7563] hover:bg-[#FFF4EA]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clear}
              >
                Tất cả địa điểm
              </button>
            </li>
          )}
          {showPopular && !allowEmpty && (
            <li className="px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-[#8A7563]">
              Điểm đến phổ biến
            </li>
          )}
          {results.map((loc) => (
            <li key={loc.id}>
              <button
                type="button"
                role="option"
                aria-selected={loc.label === value}
                className={cx(
                  "w-full px-3.5 py-2.5 text-left text-sm hover:bg-[#FFF4EA]",
                  loc.label === value && "bg-[#FFF4EA] font-semibold text-brand-600",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(loc.label)}
              >
                <span className="block text-[#2B2118]">{loc.name}</span>
                {loc.kind === "place" && (
                  <span className="block text-xs text-[#8A7563]">{loc.province}</span>
                )}
              </button>
            </li>
          ))}
          {results.length === 0 && trimmedQuery && (
            <li className="px-3.5 py-2.5 text-sm text-[#8A7563]">Không tìm thấy &ldquo;{trimmedQuery}&rdquo;</li>
          )}
        </ul>
      )}
    </div>
  );
}

export { destinationFilterTerm };
