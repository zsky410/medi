"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { PublicTripGrid } from "@/components/public-trip-grid";
import { Button, Spinner } from "@/components/ui";
import { fetchPublicTrips } from "@/lib/public-trips";
import { ArrowRight, MapPinned, Users2, Wallet, ClipboardCheck } from "lucide-react";

const DAY_COLORS = ["#FF6B2C", "#FF3D77", "#8B5CF6", "#0EA5E9", "#84CC16", "#FFC93C"];

const UNSPLASH = {
  dalat1: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=300&fit=crop&auto=format",
  dalat2: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&h=300&fit=crop&auto=format",
  hoian: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&h=300&fit=crop&auto=format",
  hagiang: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&h=300&fit=crop&auto=format",
  phuquoc: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=400&h=500&fit=crop&auto=format",
  danang: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&auto=format",
  food: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop&auto=format",
};

// ── POLAROID ─────────────────────────────────────────────────────────────────
function Polaroid({
  src,
  alt,
  caption,
  rotation = 0,
  className = "",
  tape = "top",
}: {
  src: string;
  alt: string;
  caption: string;
  rotation?: number;
  className?: string;
  tape?: "top" | "topleft" | "topright";
}) {
  const tapePos =
    tape === "topleft"
      ? "top-2 left-6 rotate-[-35deg]"
      : tape === "topright"
      ? "top-2 right-6 rotate-[30deg]"
      : "top-1 left-1/2 -translate-x-1/2 rotate-[-3deg]";
  return (
    <div
      className={`relative bg-white p-2.5 pb-8 shadow-xl border-[1.5px] border-[#F3E3D3] rounded-sm ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className={`washi-tape ${tapePos} w-14 z-10`} style={{ position: "absolute" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-cover rounded-sm" />
      <p className="font-display font-extrabold text-[#2B2118] text-xs mt-2 text-center tracking-wide">{caption}</p>
    </div>
  );
}

// ── STICKER ──────────────────────────────────────────────────────────────────
function Sticker({
  children,
  color = "#FF6B2C",
  className = "",
  rotate = 0,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-white shadow-md border-2 border-white ${className}`}
      style={{
        background: color,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
      }}
    >
      {children}
    </div>
  );
}

// ── FEATURE CARDS ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: MapPinned, title: "Lịch trình + bản đồ", desc: "Xếp ngày, kéo thả địa điểm, xem ngay trên bản đồ màu sắc", rotate: -3 },
  { icon: Users2, title: "Cộng tác realtime", desc: "Cả hội cùng chỉnh sửa một lúc — thấy nhau đang thêm gì liền", rotate: 2 },
  { icon: Wallet, title: "Chia tiền không cãi nhau", desc: "Ai trả, ai nợ, trả gọn nhất — tất cả tự tính cho bạn", rotate: -2 },
  { icon: ClipboardCheck, title: "Checklist đồ đạc", desc: "Từ áo khoác đến kem chống nắng — không sót thứ gì khi lên đường", rotate: 3 },
];

// ── HOW IT WORKS ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, color: "#FF6B2C", title: "Tạo kèo & rủ hội", desc: "Đặt tên chuyến đi, chọn điểm đến, gửi link mời bạn bè vào ngay" },
  { n: 2, color: "#FF3D77", title: "Cùng nhau lên lịch", desc: "Cả nhóm thêm địa điểm, vote, xếp ngày — realtime, không cần họp" },
  { n: 3, color: "#8B5CF6", title: "Chốt kèo, lên đường!", desc: "Xuất Google Maps, checklist đồ đạc xong là sẵn sàng bay thôi" },
];

export default function LandingPage() {
  const { data: publicTrips, isError, isLoading } = useQuery({
    queryKey: ["public-trips", "landing"],
    queryFn: () => fetchPublicTrips({ limit: 4 }),
  });
  const tickerText = "🧳 Cùng hội bạn chốt lịch trình · 🗺️ Gom địa điểm vào một bản đồ · 💸 Chia tiền rõ ràng · 🔥 Chia sẻ kèo miễn phí · ";
  const repeatedTicker = tickerText.repeat(6);

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFF9F2] overflow-x-hidden">
      <AppHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-left">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="order-2 md:order-1">
              <div className="mb-6 inline-flex">
                <Sticker color="#FF6B2C" rotate={-2}>
                  Miễn phí — rủ cả hội vào lên kèo 🔥
                </Sticker>
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#2B2118] leading-tight mb-4">
                Lên kèo du lịch, <br />
                <span className="highlight-sweep">cả hội</span> cùng chốt
              </h1>
              <p className="text-[#8A7563] text-lg font-bold leading-relaxed mb-8 max-w-md">
                Lịch trình · bản đồ · chia tiền · checklist — tất cả trong một chỗ. Thả thính, cả nhóm đồng ý, chốt đi liền!
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <Link href="/register">
                  <Button className="px-8 py-4 text-lg font-extrabold shadow-lg shadow-brand-500/20 hover:scale-105 transition-all btn-primary-glow">
                    Bắt đầu lên kèo ✈️
                  </Button>
                </Link>
                <Link
                  href="/explore"
                  className="px-6 py-4 text-base font-extrabold text-[#FF6B2C] hover:text-[#E8551A] transition-colors flex items-center gap-2"
                >
                  Xem lịch trình mẫu <ArrowRight size={18} />
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <div className="flex -space-x-2">
                  {["#FF6B2C", "#FF3D77", "#8B5CF6", "#0EA5E9", "#84CC16"].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-extrabold shadow-sm"
                      style={{ background: c }}
                    >
                      {["A", "B", "C", "D", "E"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-[#8A7563] text-sm font-bold">
                  Lên kèo cùng bạn bè, không cần gom tin nhắn thủ công
                </p>
              </div>
            </div>

            {/* Right Column - Scrapbook Collage */}
            <div className="order-1 md:order-2 relative h-80 sm:h-96 md:h-[520px]">
              {/* Dashed Route SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 520">
                <path
                  d="M140,310 Q161,231 200,200 Q279,138 340,80"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="dashed-route"
                />
                {/* Mask circle to create a clean gap for the plane */}
                <circle cx="200" cy="200" r="18" fill="#FFF9F2" />
                
                {/* Sleek Vector Plane with drop shadow */}
                <g transform="translate(200, 200) rotate(-38)">
                  {/* Shadow */}
                  <path
                    d="M0,-14 C0.8,-14 1.5,-11 1.5,-7 L12,1 C12,2 11.2,2.4 9.6,1.6 L1.5,-1.6 L1.5,6 L4.5,8.5 L4.5,9.6 L0,8.8 L-4.5,9.6 L-4.5,8.5 L-1.5,6 L-1.5,-1.6 L-9.6,1.6 C-11.2,2.4 -12,2 -12,1 L-1.5,-7 C-1.5,-11 -0.8,-14 0,-14 Z"
                    fill="rgba(43, 33, 24, 0.15)"
                    transform="translate(1, 2.5)"
                  />
                  {/* Plane body */}
                  <path
                    d="M0,-14 C0.8,-14 1.5,-11 1.5,-7 L12,1 C12,2 11.2,2.4 9.6,1.6 L1.5,-1.6 L1.5,6 L4.5,8.5 L4.5,9.6 L0,8.8 L-4.5,9.6 L-4.5,8.5 L-1.5,6 L-1.5,-1.6 L-9.6,1.6 C-11.2,2.4 -12,2 -12,1 L-1.5,-7 C-1.5,-11 -0.8,-14 0,-14 Z"
                    fill="#FF6B2C"
                    stroke="#FFF"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>

              <div className="float-1 absolute top-0 left-4 md:left-8 w-40 h-44 sm:w-48 sm:h-52">
                <Polaroid src={UNSPLASH.dalat1} alt="Đà Lạt" caption="Đà Lạt 🌸" rotation={-5} tape="topleft" className="w-full h-full" />
              </div>
              <div className="float-2 absolute top-16 right-0 md:right-4 w-36 h-40 sm:w-44 sm:h-48">
                <Polaroid src={UNSPLASH.hoian} alt="Hội An" caption="Hội An 🏮" rotation={4} tape="topright" className="w-full h-full" />
              </div>
              <div className="float-3 absolute bottom-12 left-1/2 -translate-x-1/2 w-40 h-44 sm:w-48 sm:h-52">
                <Polaroid src={UNSPLASH.hagiang} alt="Hà Giang" caption="Hà Giang 🏔️" rotation={2} tape="top" className="w-full h-full" />
              </div>

              {/* Scattered Stickers */}
              <div className="absolute top-4 right-10">
                <Sticker color="#FFC93C" rotate={12} className="text-[#2B2118]">🍜 Ăn sập</Sticker>
              </div>
              <div className="absolute bottom-24 left-2">
                <Sticker color="#14B8A6" rotate={-8}>⛺ Trekking</Sticker>
              </div>
              <div className="absolute top-1/2 right-0">
                <Sticker color="#FF3D77" rotate={5}>✈️ Bay thôi!</Sticker>
              </div>

              {/* Phone Mockup Card */}
              <div
                className="absolute bottom-0 right-4 bg-white rounded-2xl shadow-2xl border-[1.5px] border-[#F3E3D3] p-3 w-36 sm:w-44 transition-transform duration-300"
                style={{ transform: "rotate(-1deg)" }}
              >
                <div className="bg-[#FFF3EB] rounded-lg p-2 mb-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    {DAY_COLORS.slice(0, 3).map((c, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-white text-white text-[8px] font-extrabold flex items-center justify-center shadow-sm"
                        style={{ background: c }}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {["Thác Datanla", "Vườn dâu tây", "Cà phê Mê Linh"].map((p, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: DAY_COLORS[i] }} />
                        <span className="text-[9px] text-[#2B2118] font-bold truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[8px] font-extrabold text-[#8A7563] text-center">📍 Đà Lạt · 3N2Đ</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker Strip */}
        <section className="bg-[#FF6B2C] py-2.5 overflow-hidden border-y-2 border-[#2B2118] scale-105 my-8">
          <div className="ticker-track flex whitespace-nowrap">
            <span className="text-white font-display font-extrabold text-sm tracking-widest">
              {repeatedTicker}
            </span>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <div className="mb-12 space-y-3">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2118]">
              Mọi thứ cả hội cần, <br />
              <span className="gradient-text">một chỗ duy nhất</span>
            </h2>
            <p className="text-[#8A7563] text-lg font-bold">Không còn cảnh chat lộn xộn, excel chia tiền, note riêng lẻ</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 pt-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border-2 border-[#F3E3D3] p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default text-left"
                style={{ transform: `rotate(${f.rotate}deg)`, transformOrigin: "center" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm bg-[#FF6B2C]/10"
                >
                  <f.icon className="text-[#FF6B2C] stroke-[2.2px] size-7" />
                </div>
                <h3 className="font-display font-extrabold text-lg text-[#2B2118] mb-2">{f.title}</h3>
                <p className="text-[#8A7563] text-sm font-bold leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-white border-y border-[#F3E3D3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14 space-y-2">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2118]">3 bước chốt kèo</h2>
              <p className="text-[#8A7563] font-bold">Đơn giản như nhắn tin trong group chat</p>
            </div>
            <div className="flex flex-col md:flex-row items-stretch justify-center relative">
              <div
                className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] border-t-2 border-dashed border-[#F3E3D3] z-0 pointer-events-none"
                aria-hidden
              />

              {STEPS.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center flex-1 px-6 py-4 relative z-10">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-display font-extrabold text-2xl mb-4 shadow-lg border border-white/25"
                    style={{ background: s.color, boxShadow: `0 6px 24px ${s.color}55` }}
                  >
                    {s.n}
                  </div>
                  <h3 className="font-display font-extrabold text-lg text-[#2B2118] mb-2">{s.title}</h3>
                  <p className="text-[#8A7563] text-sm font-bold max-w-xs leading-relaxed">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <div className="md:hidden flex items-center my-4 text-[#F3E3D3]">
                      <div className="w-1 h-12 border-l-2 border-dashed border-[#F3E3D3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Free Public Trip Showcase */}
        <section className="py-16 md:py-24 text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2118] mb-2">Kèo hay từ mọi người</h2>
                <p className="text-[#8A7563] font-bold">Các lịch trình được chia sẻ miễn phí — chôm về sửa tên, chốt ngay!</p>
              </div>
              <Link href="/explore">
                <Button variant="secondary" className="hidden sm:flex items-center gap-2 text-xs">
                  Xem tất cả <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner className="size-10" />
              </div>
            ) : isError ? (
              <p className="py-16 text-center font-bold text-[#8A7563]">Không tải được kèo công khai. Thử lại sau nhé!</p>
            ) : publicTrips?.items.length ? (
              <PublicTripGrid trips={publicTrips.items} columns="four" />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#F3E3D3] bg-white/70 px-6 py-12 text-center">
                <p className="font-display text-xl font-extrabold text-[#2B2118]">Chưa có kèo miễn phí nào được chia sẻ.</p>
                <p className="mt-2 text-sm font-bold text-[#8A7563]">Hãy tạo một chuyến đi, bật Công khai, rồi kèo của bạn sẽ xuất hiện ở đây.</p>
              </div>
            )}
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="py-16 md:py-24 bg-white border-y border-[#F3E3D3] text-left">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 space-y-2">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2118]">
                Chơi lớn với Mê Đi <span className="gradient-text">PRO ✈️</span>
              </h2>
              <p className="text-[#8A7563] font-bold">Cốt lõi miễn phí mãi mãi. PRO cho bạn bay cao hơn.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 items-stretch">
              {/* Free */}
              <div className="bg-[#FFF9F2] rounded-2xl border-[1.5px] border-[#F3E3D3] p-7 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-[#2B2118] mb-1">Hạng phổ thông</h3>
                  <div className="font-display font-extrabold text-3xl text-[#FF6B2C] mb-6">
                    0 ₫ <span className="text-base font-bold text-[#8A7563]">mãi mãi</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      "✅ Tạo không giới hạn chuyến đi",
                      "✅ Cộng tác realtime với nhóm",
                      "✅ Bản đồ + lịch trình đầy đủ",
                      "✅ Chia tiền thông minh",
                      "✅ Checklist đồ đạc",
                    ].map((f, i) => (
                      <li key={i} className="text-sm font-bold text-[#2B2118]">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/register">
                  <Button variant="secondary" className="w-full font-extrabold">Bắt đầu miễn phí</Button>
                </Link>
              </div>

              {/* PRO */}
              <div className="relative bg-white rounded-2xl p-7 sunset-border flex flex-col justify-between" style={{ transform: "rotate(-1deg)" }}>
                <div className="absolute -top-3.5 -right-3 z-10">
                  <Sticker color="#FF6B2C" rotate={12}>Best deal 🔥</Sticker>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#8A7563] mb-0.5 italic">tuần · tháng · năm, tính năng như nhau</p>
                  <h3 className="font-display font-extrabold text-xl text-[#2B2118] mb-1">Mê Đi PRO</h3>
                  <div className="font-display font-extrabold text-3xl mb-1">
                    <span className="gradient-text">69.000 ₫</span>
                    <span className="text-base font-bold text-[#8A7563]">/tuần</span>
                  </div>
                  <p className="text-xs font-bold text-[#8A7563] mb-5">tháng 129.000 ₫ · năm 399.000 ₫</p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "✅ Tất cả tính năng Free",
                      "✨ Xuất Google Maps",
                      "✨ Xem offline",
                      "✨ Tối ưu lộ trình AI",
                      "✨ AI trợ lý lên kèo",
                      "✨ Đính kèm không giới hạn",
                      "✨ Quét email đặt chỗ",
                    ].map((f, i) => (
                      <li
                        key={i}
                        className={`text-sm ${
                          f.startsWith("✨") ? "text-[#FF6B2C] font-extrabold" : "text-[#2B2118] font-bold"
                        }`}
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Link href="/pricing">
                    <Button className="w-full font-extrabold bg-gradient-to-r from-brand-500 to-[#FF3D77] border-none shadow-lg hover:from-brand-600 hover:to-[#E8356C]">
                      Lên PRO liền 🚀
                    </Button>
                  </Link>
                  <div className="flex justify-center gap-2 mt-3.5">
                    {["SePay", "VietQR", "Chuyển khoản"].map((m, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-[#FFF3EB] text-[#8A7563] px-2 py-0.5 rounded-full border border-[#F3E3D3] font-bold"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
