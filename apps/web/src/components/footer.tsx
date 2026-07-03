"use client";

import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-[#2B2118] text-[#FFF9F2] pt-16 pb-8 text-left border-t border-[#F3E3D3]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <Logo className="brightness-0 invert" />
            <p className="text-[#FFF9F2]/60 text-sm leading-relaxed max-w-xs font-medium">
              Nền tảng lên kèo du lịch cho hội bạn Việt Nam. Vui, nhanh, miễn phí.
            </p>
          </div>
          <div>
            <p className="font-display font-extrabold mb-4 text-[#FFC93C] text-lg">Sản phẩm</p>
            <div className="flex flex-col gap-2 text-sm text-[#FFF9F2]/70 font-semibold">
              <a href="/explore" className="hover:text-white transition-colors">Khám phá</a>
              <a href="/pricing" className="hover:text-white transition-colors">Bảng giá</a>
              <a href="/ai" className="hover:text-white transition-colors">AI lên kèo ✨</a>
            </div>
          </div>
          <div>
            <p className="font-display font-extrabold mb-4 text-[#FFC93C] text-lg">Công ty</p>
            <div className="flex flex-col gap-2 text-sm text-[#FFF9F2]/70 font-semibold">
              <span className="cursor-pointer hover:text-white transition-colors">Về chúng tôi</span>
              <span className="cursor-pointer hover:text-white transition-colors">Blog du lịch</span>
              <span className="cursor-pointer hover:text-white transition-colors">Tuyển dụng</span>
              <span className="cursor-pointer hover:text-white transition-colors">Liên hệ</span>
            </div>
          </div>
          <div>
            <p className="font-display font-extrabold mb-4 text-[#FFC93C] text-lg">Pháp lý</p>
            <div className="flex flex-col gap-2 text-sm text-[#FFF9F2]/70 font-semibold">
              <span className="cursor-pointer hover:text-white transition-colors">Điều khoản</span>
              <span className="cursor-pointer hover:text-white transition-colors">Bảo mật</span>
              <span className="cursor-pointer hover:text-white transition-colors">Cookie</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="text-xs px-3 py-1.5 rounded-full bg-[#FF6B2C] text-white font-extrabold">VI</button>
              <button className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/60 hover:bg-white/20 font-extrabold">EN</button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#FFF9F2]/40 font-bold">
          <span>© 2026 Mê Đi (medi). Không quảng cáo. Không bán data. Hứa đó. 🤙</span>
          <span>Made with ☕ ở Sài Gòn</span>
        </div>
      </div>
    </footer>
  );
}
