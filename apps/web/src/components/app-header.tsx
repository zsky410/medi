"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Avatar, Button } from "./ui";
import { Logo } from "./logo";
import { Menu, X, Settings, LogOut, ChevronDown } from "lucide-react";

export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#F3E3D3] bg-[#FFF9F2]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-[#8A7563]">
          <Link
            href="/explore"
            className={`hover:text-brand-500 transition-colors ${pathname === "/explore" ? "text-brand-500" : ""}`}
          >
            Khám phá
          </Link>
          <Link
            href="/shop"
            className={`hover:text-brand-500 transition-colors ${pathname.startsWith("/shop") ? "text-brand-500" : ""}`}
          >
            Creator Shop
          </Link>
          <Link
            href="/ai"
            className={`hover:text-brand-500 transition-colors ${pathname === "/ai" ? "text-brand-500" : ""}`}
          >
            AI lên kèo ✨
          </Link>
          {user && (
            <Link
              href="/trips"
              className={`hover:text-brand-500 transition-colors ${pathname === "/trips" ? "text-brand-500" : ""}`}
            >
              Chuyến đi của tôi
            </Link>
          )}
        </div>

        {/* User / Actions */}
        {user ? (
          <div className="hidden md:flex items-center gap-5">
            {user.plan === "PRO" ? (
              <span className="rounded-full bg-gradient-to-r from-brand-500 to-[#FF3D77] px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm cursor-default">
                PRO ✨
              </span>
            ) : (
              <Link href="/pricing" className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-[#FF3D77] hover:opacity-80 transition-opacity">
                Nâng cấp PRO ✨
              </Link>
            )}

            {/* Avatar Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 focus:outline-none group p-1 rounded-full hover:bg-[#FFF3EB] transition-colors"
                aria-label="User menu"
              >
                <Avatar name={user.name} avatarUrl={user.avatarUrl} />
                <ChevronDown size={14} className="text-[#8A7563] group-hover:text-brand-500 transition-colors" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-48 rounded-2xl border-2 border-[#F3E3D3] bg-white p-2.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-[#F3E3D3]/50 mb-1.5">
                    <p className="text-xs font-semibold text-[#8A7563]">Tài khoản</p>
                    <p className="text-sm font-extrabold text-[#2B2118] truncate">{user.name}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                      pathname === "/settings"
                        ? "bg-[#FFF3EB] text-brand-500"
                        : "text-[#8A7563] hover:bg-[#FFF9F2] hover:text-[#2B2118]"
                    }`}
                  >
                    <Settings size={16} />
                    Cài đặt
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button className="text-sm">Đăng ký miễn phí</Button>
            </Link>
          </div>
        )}

        {/* Mobile menu trigger button */}
        <button
          className="md:hidden p-2 text-[#2B2118]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-[#F3E3D3] px-4 py-4 flex flex-col gap-3 text-left">
          <Link
            href="/explore"
            onClick={() => setMenuOpen(false)}
            className={`py-2 font-bold border-b border-[#F3E3D3] ${pathname === "/explore" ? "text-brand-500" : "text-[#2B2118]"}`}
          >
            Khám phá
          </Link>
          <Link
            href="/shop"
            onClick={() => setMenuOpen(false)}
            className={`py-2 font-bold border-b border-[#F3E3D3] ${pathname.startsWith("/shop") ? "text-brand-500" : "text-[#2B2118]"}`}
          >
            Creator Shop
          </Link>
          <Link
            href="/ai"
            onClick={() => setMenuOpen(false)}
            className={`py-2 font-bold border-b border-[#F3E3D3] ${pathname === "/ai" ? "text-brand-500" : "text-[#2B2118]"}`}
          >
            AI lên kèo ✨
          </Link>
          {user ? (
            <>
              <Link
                href="/trips"
                onClick={() => setMenuOpen(false)}
                className={`py-2 font-bold border-b border-[#F3E3D3] ${pathname === "/trips" ? "text-brand-500" : "text-[#2B2118]"}`}
              >
                Chuyến đi của tôi
              </Link>
              {user.plan !== "PRO" && (
                <Link
                  href="/pricing"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 font-bold border-b border-[#F3E3D3] text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-[#FF3D77]"
                >
                  Nâng cấp PRO ✨
                </Link>
              )}
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className={`py-2 font-bold border-b border-[#F3E3D3] flex items-center gap-1.5 ${pathname === "/settings" ? "text-brand-500" : "text-[#2B2118]"}`}
              >
                <Settings size={16} />
                Cài đặt
              </Link>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Avatar name={user.name} avatarUrl={user.avatarUrl} size={28} />
                  <span className="font-bold text-[#2B2118]">{user.name}</span>
                </div>
                <Button variant="ghost" onClick={() => { logout(); setMenuOpen(false); }} className="text-xs py-1.5 px-3 flex items-center gap-1">
                  <LogOut size={14} />
                  Đăng xuất
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1">
                <Button variant="ghost" className="w-full text-sm">Đăng nhập</Button>
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1">
                <Button className="w-full text-sm">Đăng ký</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
