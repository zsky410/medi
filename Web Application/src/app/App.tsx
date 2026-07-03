import { useState, useEffect, useRef } from "react";
import { MapPin, Users, DollarSign, CheckSquare, Share2, Zap, Star, ChevronDown, ArrowRight, Plane, X, Menu } from "lucide-react";

const DAY_COLORS = ["#FF6B2C", "#FF3D77", "#8B5CF6", "#0EA5E9", "#84CC16", "#FFC93C"];

const UNSPLASH = {
  dalat1: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=300&fit=crop&auto=format",
  dalat2: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&h=300&fit=crop&auto=format",
  hoian: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&h=300&fit=crop&auto=format",
  hagiang: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&h=300&fit=crop&auto=format",
  phuquoc: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=400&h=500&fit=crop&auto=format",
  danang: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&auto=format",
  food: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop&auto=format",
  hero: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=600&h=800&fit=crop&auto=format",
};

// ── Inline keyframes injected once ──────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes float { 0%,100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(-2deg); } }
    @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(2deg); } 50% { transform: translateY(-6px) rotate(2deg); } }
    @keyframes float3 { 0%,100% { transform: translateY(0px) rotate(-1deg); } 50% { transform: translateY(-10px) rotate(-1deg); } }
    @keyframes plane { 0% { transform: translateX(-20px); } 100% { transform: translateX(20px); } }
    @keyframes pulse-glow { 0%,100% { box-shadow: 0 4px 24px rgba(255,107,44,0.35); } 50% { box-shadow: 0 4px 40px rgba(255,107,44,0.6); } }
    @keyframes dash-move { to { stroke-dashoffset: -20; } }
    @keyframes stamp-in { 0% { transform: scale(2) rotate(-15deg); opacity:0; } 100% { transform: scale(1) rotate(-15deg); opacity:1; } }
    @keyframes confetti { 0% { transform: translateY(-10px) rotate(0deg); opacity:1; } 100% { transform: translateY(60px) rotate(360deg); opacity:0; } }
    body { font-family: 'Be Vietnam Pro', sans-serif; }
    h1,h2,h3,.font-display { font-family: 'Baloo 2', sans-serif; }
    .ticker-track { animation: ticker 28s linear infinite; }
    .ticker-track:hover { animation-play-state: paused; }
    .float-1 { animation: float 4s ease-in-out infinite; }
    .float-2 { animation: float2 3.5s ease-in-out infinite; }
    .float-3 { animation: float3 5s ease-in-out infinite; }
    .btn-primary { animation: pulse-glow 3s ease-in-out infinite; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #F3E3D3; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: #FF6B2C; }
    .perforated { border-top: 2px dashed #F3E3D3; }
    .highlight-sweep {
      background: linear-gradient(transparent 55%, rgba(255,201,60,0.55) 55%, rgba(255,201,60,0.55) 92%, transparent 92%);
      display: inline;
      padding: 0 4px;
    }
    .gradient-text {
      background: linear-gradient(90deg, #FF6B2C, #FF3D77);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .sunset-border {
      border: 2px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(135deg, #FF6B2C, #FF3D77) border-box;
    }
    .washi-tape {
      position: absolute;
      height: 22px;
      background: rgba(255,201,60,0.55);
      border-radius: 2px;
      transform: rotate(-5deg);
    }
    .torn-bottom {
      position: relative;
    }
    .torn-bottom::after {
      content: '';
      position: absolute;
      bottom: -18px;
      left: 0; right: 0;
      height: 20px;
      background: #FFF9F2;
      clip-path: polygon(0% 100%, 2% 0%, 5% 80%, 8% 10%, 11% 70%, 14% 5%, 17% 90%, 20% 15%, 23% 85%, 26% 0%, 29% 75%, 32% 10%, 35% 90%, 38% 20%, 41% 80%, 44% 5%, 47% 95%, 50% 10%, 53% 85%, 56% 0%, 59% 90%, 62% 15%, 65% 80%, 68% 5%, 71% 90%, 74% 10%, 77% 85%, 80% 0%, 83% 80%, 86% 10%, 89% 90%, 92% 5%, 95% 85%, 98% 10%, 100% 100%);
    }
    .faq-body { overflow: hidden; transition: max-height 0.3s ease; }
    .boarding-card { background: white; border-radius: 16px; border: 1.5px solid #F3E3D3; overflow: hidden; }
    .notch-line { position: relative; }
    .notch-line::before, .notch-line::after {
      content: '';
      position: absolute;
      width: 20px; height: 20px;
      background: #FFF9F2;
      border-radius: 50%;
      top: -10px;
    }
    .notch-line::before { left: -10px; }
    .notch-line::after { right: -10px; }
    .dashed-route { stroke-dasharray: 6,4; animation: dash-move 1s linear infinite; }
    .tab-active { background: #FF6B2C; color: white; box-shadow: 0 4px 16px rgba(255,107,44,0.3); }
    .tab-inactive { background: white; color: #8A7563; border: 1.5px solid #F3E3D3; }
    .tab-inactive:hover { border-color: #FF6B2C; color: #FF6B2C; }
  `}</style>
);

// ── Components ───────────────────────────────────────────────────────────────

function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? "w-7 h-7 text-sm" : size === "lg" ? "w-12 h-12 text-xl" : "w-9 h-9 text-base";
  const t = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl";
  return (
    <div className="flex items-center gap-2">
      <div className={`${s} bg-[#FF6B2C] rounded-xl flex items-center justify-center font-display font-extrabold text-white shadow-sm`}>
        M
      </div>
      <span className={`font-display font-extrabold ${t} text-[#2B2118]`}>
        Mê Đi<span className="text-[#FFC93C]">.</span>
      </span>
    </div>
  );
}

function OrangePill({ children, onClick, className = "", size = "md" }: { children: React.ReactNode; onClick?: () => void; className?: string; size?: "sm" | "md" | "lg" }) {
  const p = size === "sm" ? "px-4 py-1.5 text-sm" : size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-2.5 text-base";
  return (
    <button
      onClick={onClick}
      className={`btn-primary ${p} bg-[#FF6B2C] text-white font-bold rounded-full hover:bg-[#E8551A] transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

function CreamPill({ children, onClick, className = "", size = "md" }: { children: React.ReactNode; onClick?: () => void; className?: string; size?: "sm" | "md" | "lg" }) {
  const p = size === "sm" ? "px-4 py-1.5 text-sm" : size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-2.5 text-base";
  return (
    <button
      onClick={onClick}
      className={`${p} bg-[#FFF3EB] text-[#2B2118] font-semibold rounded-full border-[1.5px] border-[#F3E3D3] hover:border-[#FF6B2C] hover:text-[#FF6B2C] transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

// ── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ activePage, setPage }: { activePage: string; setPage: (p: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-[#FFF9F2]/90 backdrop-blur-md border-b border-[#F3E3D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => setPage("landing")}><Logo /></button>
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#8A7563]">
          <button onClick={() => setPage("explore")} className={`hover:text-[#FF6B2C] transition-colors ${activePage === "explore" ? "text-[#FF6B2C]" : ""}`}>Khám phá</button>
          <button onClick={() => setPage("pricing")} className={`hover:text-[#FF6B2C] transition-colors ${activePage === "pricing" ? "text-[#FF6B2C]" : ""}`}>Bảng giá</button>
          <button onClick={() => setPage("ai")} className={`hover:text-[#FF6B2C] transition-colors ${activePage === "ai" ? "text-[#FF6B2C]" : ""}`}>AI lên kèo ✨</button>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => setPage("auth")} className="text-sm font-semibold text-[#8A7563] hover:text-[#2B2118] transition-colors px-4 py-2 rounded-full border-[1.5px] border-[#F3E3D3] hover:border-[#FF6B2C]">
            Đăng nhập
          </button>
          <OrangePill size="sm" onClick={() => setPage("auth")}>Đăng ký miễn phí</OrangePill>
        </div>
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-[#F3E3D3] px-4 py-4 flex flex-col gap-3">
          {["explore","pricing","ai","auth"].map(p => (
            <button key={p} onClick={() => { setPage(p); setMenuOpen(false); }} className="text-left py-2 font-semibold text-[#2B2118] border-b border-[#F3E3D3]">
              {p === "explore" ? "Khám phá" : p === "pricing" ? "Bảng giá" : p === "ai" ? "AI lên kèo ✨" : "Đăng nhập / Đăng ký"}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ── TICKER ───────────────────────────────────────────────────────────────────
function Ticker() {
  const text = "🧳 12.000+ hội bạn đã chốt kèo cùng Mê Đi · 45.000 lịch trình đã tạo · ✈ 128 điểm đến phổ biến · 🔥 Hoàn toàn miễn phí · ";
  const repeated = text.repeat(6);
  return (
    <div className="bg-[#FF6B2C] py-2.5 overflow-hidden">
      <div className="ticker-track flex whitespace-nowrap">
        <span className="text-white font-semibold text-sm tracking-wide pr-0">{repeated}{repeated}</span>
      </div>
    </div>
  );
}

// ── POLAROID ─────────────────────────────────────────────────────────────────
function Polaroid({ src, alt, caption, rotation = 0, className = "", tape = "top" }: {
  src: string; alt: string; caption: string; rotation?: number; className?: string; tape?: "top" | "topleft" | "topright";
}) {
  const tapePos = tape === "topleft" ? "top-2 left-6 rotate-[-35deg]" : tape === "topright" ? "top-2 right-6 rotate-[30deg]" : "top-1 left-1/2 -translate-x-1/2 rotate-[-3deg]";
  return (
    <div className={`relative bg-white p-2.5 pb-8 shadow-xl border-[1.5px] border-[#F3E3D3] rounded-sm ${className}`} style={{ transform: `rotate(${rotation}deg)` }}>
      <div className={`washi-tape ${tapePos} w-14 z-10`} style={{ position: "absolute" }} />
      <img src={src} alt={alt} className="w-full h-full object-cover rounded-sm" />
      <p className="font-display font-bold text-[#2B2118] text-xs mt-2 text-center tracking-wide">{caption}</p>
    </div>
  );
}

// ── STICKER ──────────────────────────────────────────────────────────────────
function Sticker({ children, color = "#FF6B2C", className = "", rotate = 0 }: { children: React.ReactNode; color?: string; className?: string; rotate?: number }) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md border-2 border-white ${className}`}
      style={{ background: color, transform: `rotate(${rotate}deg)`, boxShadow: "0 3px 10px rgba(0,0,0,0.15)" }}
    >
      {children}
    </div>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ setPage }: { setPage: (p: string) => void }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left */}
        <div className="order-2 md:order-1">
          <div className="mb-6 inline-flex">
            <Sticker color="#FF6B2C" rotate={-2}>Miễn phí — rủ cả hội vào lên kèo 🔥</Sticker>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#2B2118] leading-tight mb-4">
            Lên kèo du lịch,{" "}
            <br />
            <span className="highlight-sweep">cả hội</span>{" "}
            cùng chốt
          </h1>
          <p className="text-[#8A7563] text-lg leading-relaxed mb-8 max-w-md">
            Lịch trình · bản đồ · chia tiền · checklist — tất cả trong một chỗ. Thả thính, cả nhóm đồng ý, chốt đi liền!
          </p>
          <div className="flex flex-wrap gap-3">
            <OrangePill size="lg" onClick={() => setPage("auth")}>
              Bắt đầu lên kèo ✈
            </OrangePill>
            <button onClick={() => setPage("explore")} className="px-8 py-4 text-lg font-semibold text-[#FF6B2C] hover:text-[#E8551A] transition-colors flex items-center gap-2">
              Xem lịch trình mẫu <ArrowRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-8">
            <div className="flex -space-x-2">
              {["#FF6B2C","#FF3D77","#8B5CF6","#0EA5E9","#84CC16"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: c }}>
                  {["A","B","C","D","E"][i]}
                </div>
              ))}
            </div>
            <p className="text-[#8A7563] text-sm">
              <span className="text-[#2B2118] font-bold">12.000+</span> hội bạn đang lên kèo
            </p>
          </div>
        </div>

        {/* Right — collage */}
        <div className="order-1 md:order-2 relative h-80 sm:h-96 md:h-[520px]">
          {/* Dashed route */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 520">
            <path d="M80,400 Q150,250 200,200 Q280,140 340,80" fill="none" stroke="#FF6B2C" strokeWidth="2" strokeDasharray="8,5" className="dashed-route" />
            <text x="198" y="195" fontSize="16">✈</text>
          </svg>

          <div className="float-1 absolute top-0 left-4 md:left-8 w-40 h-44 sm:w-48 sm:h-52">
            <Polaroid src={UNSPLASH.dalat1} alt="Đà Lạt" caption="Đà Lạt 🌸" rotation={-5} tape="topleft" className="w-full h-full" />
          </div>
          <div className="float-2 absolute top-16 right-0 md:right-4 w-36 h-40 sm:w-44 sm:h-48">
            <Polaroid src={UNSPLASH.hoian} alt="Hội An" caption="Hội An 🏮" rotation={4} tape="topright" className="w-full h-full" />
          </div>
          <div className="float-3 absolute bottom-12 left-1/2 -translate-x-1/2 w-40 h-44 sm:w-48 sm:h-52">
            <Polaroid src={UNSPLASH.hagiang} alt="Hà Giang" caption="Hà Giang 🏔" rotation={2} tape="top" className="w-full h-full" />
          </div>

          {/* Stickers scattered */}
          <Sticker color="#FFC93C" className="absolute top-4 right-10 text-[#2B2118]" rotate={12}>🍜 Ăn sập</Sticker>
          <Sticker color="#14B8A6" className="absolute bottom-24 left-2" rotate={-8}>⛺ Trekking</Sticker>
          <Sticker color="#FF3D77" className="absolute top-1/2 right-0" rotate={5}>✈ Bay thôi!</Sticker>

          {/* Phone mockup card */}
          <div className="absolute bottom-0 right-4 bg-white rounded-2xl shadow-2xl border-[1.5px] border-[#F3E3D3] p-3 w-36 sm:w-44" style={{ transform: "rotate(-1deg)" }}>
            <div className="bg-[#FFF3EB] rounded-lg p-2 mb-2">
              <div className="flex items-center gap-1.5 mb-2">
                {DAY_COLORS.slice(0,3).map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white text-white text-[8px] font-bold flex items-center justify-center" style={{ background: c }}>{i+1}</div>
                ))}
              </div>
              <div className="space-y-1">
                {["Thác Datanla","Vườn dâu Strawberry","Cà phê Mê Linh"].map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: DAY_COLORS[i] }} />
                    <span className="text-[9px] text-[#2B2118] font-medium truncate">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[8px] text-[#8A7563] text-center">📍 Đà Lạt · 3N2Đ</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FEATURE CARDS ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🗺", title: "Lịch trình + bản đồ", desc: "Xếp ngày, kéo thả địa điểm, xem ngay trên bản đồ màu sắc", color: "#FF6B2C", rotate: -3 },
  { icon: "👥", title: "Cộng tác realtime", desc: "Cả hội cùng chỉnh sửa một lúc — thấy nhau đang thêm gì liền", color: "#FF3D77", rotate: 2 },
  { icon: "💸", title: "Chia tiền không cãi nhau", desc: "Ai trả, ai nợ, trả gọn nhất — tất cả tự tính cho bạn", color: "#8B5CF6", rotate: -2 },
  { icon: "✅", title: "Checklist đồ đạc", desc: "Từ áo khoác đến kem chống nắng — không sót thứ gì khi lên đường", color: "#0EA5E9", rotate: 3 },
];

function FeaturesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2118] mb-3">
          Mọi thứ cả hội cần,<br /><span className="gradient-text">một chỗ duy nhất</span>
        </h2>
        <p className="text-[#8A7563] text-lg">Không còn cảnh chat lộn xộn, excel chia tiền, note riêng lẻ</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default"
            style={{ transform: `rotate(${f.rotate}deg)`, transformOrigin: "center" }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm" style={{ background: `${f.color}20` }}>
              {f.icon}
            </div>
            <h3 className="font-display font-bold text-lg text-[#2B2118] mb-2">{f.title}</h3>
            <p className="text-[#8A7563] text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── HOW IT WORKS ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, color: "#FF6B2C", title: "Tạo kèo & rủ hội", desc: "Đặt tên chuyến đi, chọn điểm đến, gửi link mời bạn bè vào ngay" },
  { n: 2, color: "#FF3D77", title: "Cùng nhau lên lịch", desc: "Cả nhóm thêm địa điểm, vote, xếp ngày — realtime, không cần họp" },
  { n: 3, color: "#8B5CF6", title: "Chốt kèo, lên đường!", desc: "Xuất Google Maps, checklist đồ đạc xong là sẵn sàng bay thôi" },
];

function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white border-y border-[#F3E3D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2118] mb-2">3 bước chốt kèo</h2>
          <p className="text-[#8A7563]">Đơn giản như nhắn tin trong group chat</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-0 relative">
          {/* Connecting dashes desktop */}
          <svg className="hidden md:block absolute top-8 left-0 w-full h-1 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 900 4">
            <path d="M150,2 L380,2 M520,2 L750,2" stroke="#F3E3D3" strokeWidth="2" strokeDasharray="8,4" />
            <text x="450" y="6" fontSize="12" textAnchor="middle">✈</text>
          </svg>

          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center flex-1 px-6 py-4 relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-display font-extrabold text-2xl mb-4 shadow-lg"
                style={{ background: s.color, boxShadow: `0 6px 24px ${s.color}55` }}
              >
                {s.n}
              </div>
              <h3 className="font-display font-bold text-lg text-[#2B2118] mb-2">{s.title}</h3>
              <p className="text-[#8A7563] text-sm max-w-xs leading-relaxed">{s.desc}</p>
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
  );
}

// ── BOARDING PASS SHOWCASE ────────────────────────────────────────────────────
const ITINERARIES = [
  { code: "DLI", dest: "Đà Lạt", duration: "3N2Đ", dates: "14–16/08", author: "Trang M.", img: UNSPLASH.dalat2, color: "#FF6B2C", stolen: 128 },
  { code: "DAN", dest: "Đà Nẵng–Hội An", duration: "4N3Đ", dates: "22–25/09", author: "Minh K.", img: UNSPLASH.danang, color: "#FF3D77", stolen: 86 },
  { code: "HAN", dest: "Hà Giang", duration: "5N4Đ", dates: "05–09/10", author: "Linh T.", img: UNSPLASH.hagiang, color: "#8B5CF6", stolen: 214 },
  { code: "PQC", dest: "Phú Quốc", duration: "3N2Đ", dates: "30/11–02/12", author: "Nam B.", img: UNSPLASH.phuquoc, color: "#0EA5E9", stolen: 97 },
  { code: "SGN", dest: "Sài Gòn ẩm thực", duration: "2N1Đ", dates: "Weekend", author: "Hà P.", img: UNSPLASH.food, color: "#84CC16", stolen: 163 },
];

function BoardingPassShowcase({ setPage }: { setPage: (p: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2118] mb-2">Kèo hay từ hội bạn</h2>
            <p className="text-[#8A7563]">Thấy kèo ngon — chôm về sửa tên, chốt ngay!</p>
          </div>
          <button onClick={() => setPage("explore")} className="hidden sm:flex items-center gap-2 text-[#FF6B2C] font-semibold hover:gap-3 transition-all">
            Xem tất cả <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 snap-x snap-mandatory" style={{ scrollbarWidth: "thin" }}>
        {ITINERARIES.map((item, i) => (
          <div
            key={i}
            className="boarding-card flex-shrink-0 w-72 snap-start cursor-pointer group hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative h-36 overflow-hidden">
              <img src={item.img} alt={item.dest} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="text-white text-2xl font-display font-extrabold tracking-wider">{item.code}</span>
                <span className="text-white/70 text-sm ml-2">{item.duration}</span>
              </div>
              <div className="absolute top-3 right-3">
                <Sticker color={item.color} className="text-[10px] !px-2 !py-1">✈ {item.duration}</Sticker>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-display font-bold text-[#2B2118] leading-tight">{item.dest}</h3>
                  <p className="text-[#8A7563] text-xs mt-0.5">📅 {item.dates}</p>
                </div>
                <div className="flex items-center gap-1 text-[#8A7563] text-xs">
                  <span className="text-[#FF6B2C] font-bold">😎 {item.stolen}</span>
                  <span>chôm</span>
                </div>
              </div>
              <div className="perforated pt-3 mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: item.color }}>
                    {item.author[0]}
                  </div>
                  <span className="text-xs text-[#8A7563]">{item.author}</span>
                </div>
                <button onClick={() => setPage("auth")} className="text-xs font-bold text-[#FF6B2C] hover:text-[#E8551A]">Chôm về →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── PRICING TEASER ────────────────────────────────────────────────────────────
function PricingTeaser({ setPage }: { setPage: (p: string) => void }) {
  return (
    <section className="py-16 md:py-24 bg-white border-y border-[#F3E3D3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#2B2118] mb-2">
            Chơi lớn với Mê Đi <span className="gradient-text">PRO ✈</span>
          </h2>
          <p className="text-[#8A7563]">Cốt lõi miễn phí mãi mãi. PRO cho bạn bay cao hơn.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-[#FFF9F2] rounded-2xl border-[1.5px] border-[#F3E3D3] p-7">
            <h3 className="font-display font-extrabold text-xl text-[#2B2118] mb-1">Hạng phổ thông</h3>
            <div className="font-display font-extrabold text-3xl text-[#FF6B2C] mb-6">0 ₫ <span className="text-base font-semibold text-[#8A7563]">mãi mãi</span></div>
            <ul className="space-y-2.5 mb-8">
              {["✅ Tạo không giới hạn chuyến đi","✅ Cộng tác realtime với nhóm","✅ Bản đồ + lịch trình đầy đủ","✅ Chia tiền thông minh","✅ Checklist đồ đạc"].map((f, i) => (
                <li key={i} className="text-sm text-[#2B2118]">{f}</li>
              ))}
            </ul>
            <CreamPill className="w-full justify-center" onClick={() => setPage("auth")}>Bắt đầu miễn phí</CreamPill>
          </div>
          {/* PRO */}
          <div className="relative bg-white rounded-2xl p-7 sunset-border" style={{ transform: "rotate(-1deg)" }}>
            <div className="absolute -top-3 -right-3 z-10">
              <Sticker color="#FF6B2C" rotate={12}>Best deal 🔥</Sticker>
            </div>
            <p className="text-xs text-[#8A7563] mb-0.5 italic">rẻ hơn 1 bữa lẩu mỗi tháng</p>
            <h3 className="font-display font-extrabold text-xl text-[#2B2118] mb-1">Mê Đi PRO</h3>
            <div className="font-display font-extrabold text-3xl mb-1">
              <span className="gradient-text">399.000 ₫</span>
              <span className="text-base font-semibold text-[#8A7563]">/năm</span>
            </div>
            <p className="text-xs text-[#8A7563] mb-5">≈ 33.000 ₫/tháng</p>
            <ul className="space-y-2.5 mb-8">
              {["✅ Tất cả tính năng Free","✨ Xuất Google Maps","✨ Xem offline","✨ Tối ưu lộ trình AI","✨ AI trợ lý lên kèo","✨ Đính kèm không giới hạn","✨ Quét email đặt chỗ"].map((f, i) => (
                <li key={i} className={`text-sm ${f.startsWith("✨") ? "text-[#FF6B2C] font-semibold" : "text-[#2B2118]"}`}>{f}</li>
              ))}
            </ul>
            <OrangePill className="w-full justify-center" onClick={() => setPage("pricing")}>Lên PRO liền 🚀</OrangePill>
            <div className="flex justify-center gap-2 mt-3">
              {["💳","MoMo","VNPay","Zalo"].map((m, i) => (
                <span key={i} className="text-[10px] bg-[#FFF3EB] text-[#8A7563] px-2 py-0.5 rounded-full border border-[#F3E3D3]">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({ setPage }: { setPage: (p: string) => void }) {
  return (
    <footer className="bg-[#2B2118] text-[#FFF9F2] pt-16 pb-8 relative overflow-hidden">
      {/* Doodle bg */}
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none text-6xl flex flex-wrap gap-8 p-8 overflow-hidden">
        {"✈🧳🗺📍🏔🌊🌸🍜🛵⛺🎒🏖" .split("").map((e, i) => <span key={i}>{e}</span>)}
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <Logo size="md" />
            <p className="text-[#FFF9F2]/60 text-sm mt-3 leading-relaxed max-w-xs">
              Nền tảng lên kèo du lịch cho hội bạn Việt Nam. Vui, nhanh, miễn phí.
            </p>
          </div>
          <div>
            <p className="font-display font-bold mb-4 text-[#FFC93C]">Sản phẩm</p>
            <div className="flex flex-col gap-2 text-sm text-[#FFF9F2]/70">
              {[["Khám phá","explore"],["Bảng giá","pricing"],["AI lên kèo","ai"]].map(([l,p]) => (
                <button key={p} onClick={() => setPage(p)} className="text-left hover:text-white transition-colors">{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-display font-bold mb-4 text-[#FFC93C]">Công ty</p>
            <div className="flex flex-col gap-2 text-sm text-[#FFF9F2]/70">
              {["Về chúng tôi","Blog du lịch","Tuyển dụng","Liên hệ"].map(t => (
                <span key={t} className="cursor-pointer hover:text-white transition-colors">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-display font-bold mb-4 text-[#FFC93C]">Pháp lý</p>
            <div className="flex flex-col gap-2 text-sm text-[#FFF9F2]/70">
              {["Điều khoản","Bảo mật","Cookie"].map(t => (
                <span key={t} className="cursor-pointer hover:text-white transition-colors">{t}</span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="text-xs px-3 py-1.5 rounded-full bg-[#FF6B2C] text-white font-semibold">VI</button>
              <button className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/60 hover:bg-white/20">EN</button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#FFF9F2]/40">
          <span>© 2026 Mê Đi. Không quảng cáo. Không bán data. Hứa đó. 🤙</span>
          <span>Made with ☕ ở Sài Gòn</span>
        </div>
      </div>
    </footer>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage({ setPage }: { setPage: (p: string) => void }) {
  return (
    <>
      <Hero setPage={setPage} />
      <Ticker />
      <FeaturesSection />
      <HowItWorks />
      <BoardingPassShowcase setPage={setPage} />
      <PricingTeaser setPage={setPage} />
    </>
  );
}

// ── AUTH PAGE ─────────────────────────────────────────────────────────────────
function AuthPage({ setPage }: { setPage: (p: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <div className="min-h-screen flex" style={{ background: "#FFF9F2" }}>
      {/* Boarding pass center */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Faint doodles */}
        <div className="absolute inset-0 opacity-5 pointer-events-none text-5xl flex flex-wrap gap-16 p-12 overflow-hidden">
          {"✈🧳🗺📍🏔🌊🌸🍜🛵⛺🎒".split("").map((e, i) => <span key={i}>{e}</span>)}
        </div>
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl border-[1.5px] border-[#F3E3D3] w-full max-w-md overflow-hidden">
          {/* Passport stamp */}
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-4 border-[#FF6B2C] flex items-center justify-center text-[#FF6B2C] text-center font-display font-extrabold text-[9px] leading-tight rotate-12 opacity-50">
            MÊ ĐI<br />CHECK-IN
          </div>
          <div className="p-8 pb-0">
            <div className="flex justify-center mb-6"><Logo size="lg" /></div>
            <div className="flex rounded-full bg-[#FFF3EB] p-1 mb-6">
              {(["login","register"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${mode === m ? "bg-[#FF6B2C] text-white shadow" : "text-[#8A7563]"}`}
                >
                  {m === "login" ? "Đăng nhập" : "Đăng ký"}
                </button>
              ))}
            </div>
            <div className="space-y-3 mb-4">
              {mode === "register" && (
                <input type="text" placeholder="Tên của bạn ✏️" className="w-full px-4 py-3 rounded-2xl border-[1.5px] border-[#F3E3D3] focus:border-[#FF6B2C] outline-none text-sm bg-[#FFF9F2] transition-colors" />
              )}
              <input type="email" placeholder="Email 📧" className="w-full px-4 py-3 rounded-2xl border-[1.5px] border-[#F3E3D3] focus:border-[#FF6B2C] outline-none text-sm bg-[#FFF9F2] transition-colors" />
              <input type="password" placeholder="Mật khẩu 🔑" className="w-full px-4 py-3 rounded-2xl border-[1.5px] border-[#F3E3D3] focus:border-[#FF6B2C] outline-none text-sm bg-[#FFF9F2] transition-colors" />
            </div>
            <OrangePill className="w-full justify-center mb-3" onClick={() => setPage("dashboard")}>
              {mode === "login" ? "Đăng nhập 🚀" : "Tạo tài khoản ✈"}
            </OrangePill>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-[#F3E3D3]" /><span className="text-xs text-[#8A7563]">hoặc</span><div className="flex-1 h-px bg-[#F3E3D3]" />
            </div>
            <CreamPill className="w-full justify-center mb-4" onClick={() => setPage("dashboard")}>
              <span className="mr-2">🔵</span> Tiếp tục với Google
            </CreamPill>
          </div>
          {/* Perforated stub */}
          <div className="notch-line mx-4 border-t-2 border-dashed border-[#F3E3D3] mt-2 pt-4 pb-5 px-4 text-center">
            <p className="text-sm text-[#8A7563]">
              {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-[#FF6B2C] font-bold hover:underline">
                {mode === "login" ? "Đăng ký miễn phí" : "Đăng nhập"}
              </button>
            </p>
          </div>
        </div>
      </div>
      {/* Sunset right panel — desktop */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FF6B2C, #FF3D77)" }}>
        <div className="relative z-10 p-12 text-white text-center max-w-sm">
          <div className="float-1 inline-block mb-8">
            <Polaroid src={UNSPLASH.hoian} alt="Hội An" caption="Hội An 🏮" rotation={-4} tape="top" className="w-56 h-44 shadow-2xl" />
          </div>
          <p className="font-display font-extrabold text-2xl leading-snug">"Chuyến đi để đời bắt đầu từ một cái hẹn."</p>
          <p className="mt-3 text-white/70 text-sm">— Hội du lịch Mê Đi</p>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
const TRIPS = [
  { title: "Đà Lạt hội bạn thân", dest: "Đà Lạt", dates: "14–16/08", countdown: 43, members: 4, color: "#FF6B2C", img: UNSPLASH.dalat1, invited: false },
  { title: "Hội An solo girls", dest: "Hội An", dates: "22–25/09", countdown: 82, members: 3, color: "#FF3D77", img: UNSPLASH.hoian, invited: true },
  { title: "Hà Giang mùa lúa", dest: "Hà Giang", dates: "05–09/10", countdown: 95, members: 6, color: "#8B5CF6", img: UNSPLASH.hagiang, invited: false },
];

function DashboardPage({ setPage }: { setPage: (p: string) => void }) {
  const [filter, setFilter] = useState("Sắp tới");
  const [newTrip, setNewTrip] = useState(false);
  const filters = ["Sắp tới","Đang lên kèo","Đã đi","Được rủ"];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-[#2B2118]">Chào Demo 👋</h1>
          <p className="text-[#8A7563] mt-1">Sắp đi đâu chơi đây?</p>
        </div>
        <OrangePill onClick={() => setNewTrip(true)}>+ Lên kèo mới</OrangePill>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === f ? "tab-active" : "tab-inactive"}`}
          >
            {f}
          </button>
        ))}
      </div>
      {/* Trip cards — polaroid grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {TRIPS.map((t, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative"
            style={{ transform: `rotate(${[-1.5,1,-2][i]}deg)` }}
            onClick={() => setPage("trip")}
          >
            {t.invited && (
              <div className="absolute top-3 left-3 z-10">
                <Sticker color="#FF3D77">Bạn được rủ 🎟</Sticker>
              </div>
            )}
            {/* Washi tape */}
            <div className="absolute top-2 right-8 z-10 h-4 w-12 rotate-[20deg]" style={{ background: "rgba(255,201,60,0.6)", borderRadius: 2 }} />
            <div className="relative h-44 overflow-hidden">
              <img src={t.img} alt={t.dest} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-3 right-3">
                <div className="flex -space-x-1.5">
                  {Array.from({ length: t.members }).map((_, j) => (
                    <div key={j} className="w-7 h-7 rounded-full border-2 border-white text-white text-xs font-bold flex items-center justify-center" style={{ background: DAY_COLORS[j % 6] }}>
                      {["A","B","C","D","E","F"][j]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-display font-bold text-[#2B2118] text-lg mb-1">{t.title}</h3>
              <p className="text-[#8A7563] text-sm">📍 {t.dest} · {t.dates}</p>
              <div className="mt-3 inline-flex">
                <Sticker color={t.color} className="text-xs">Còn {t.countdown} ngày 🔥</Sticker>
              </div>
            </div>
          </div>
        ))}
        {/* Add new */}
        <button
          onClick={() => setNewTrip(true)}
          className="border-2 border-dashed border-[#F3E3D3] rounded-2xl h-64 flex flex-col items-center justify-center gap-3 text-[#8A7563] hover:border-[#FF6B2C] hover:text-[#FF6B2C] transition-colors"
        >
          <span className="text-4xl">+</span>
          <span className="font-semibold">Lên kèo mới</span>
        </button>
      </div>

      {/* New trip modal */}
      {newTrip && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setNewTrip(false)}>
          <div className="bg-white rounded-3xl shadow-2xl border-[1.5px] border-[#F3E3D3] p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-extrabold text-2xl text-[#2B2118]">🧳 Lên kèo mới</h2>
              <button onClick={() => setNewTrip(false)} className="text-[#8A7563] hover:text-[#2B2118]"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Tên chuyến đi..." className="w-full px-4 py-3 rounded-2xl border-[1.5px] border-[#F3E3D3] focus:border-[#FF6B2C] outline-none text-sm bg-[#FFF9F2]" />
              <input type="text" placeholder="Điểm đến 📍" className="w-full px-4 py-3 rounded-2xl border-[1.5px] border-[#F3E3D3] focus:border-[#FF6B2C] outline-none text-sm bg-[#FFF9F2]" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="px-4 py-3 rounded-2xl border-[1.5px] border-[#F3E3D3] focus:border-[#FF6B2C] outline-none text-sm bg-[#FFF9F2]" />
                <input type="date" className="px-4 py-3 rounded-2xl border-[1.5px] border-[#F3E3D3] focus:border-[#FF6B2C] outline-none text-sm bg-[#FFF9F2]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2B2118] mb-2">Ảnh bìa</p>
                <div className="grid grid-cols-3 gap-2">
                  {[UNSPLASH.dalat1, UNSPLASH.hoian, UNSPLASH.hagiang, UNSPLASH.phuquoc, UNSPLASH.danang, UNSPLASH.food].map((src, j) => (
                    <img key={j} src={src} alt="" className="h-16 w-full object-cover rounded-xl cursor-pointer hover:ring-2 ring-[#FF6B2C] transition-all" />
                  ))}
                </div>
              </div>
            </div>
            <OrangePill className="w-full justify-center mt-6" onClick={() => { setNewTrip(false); setPage("trip"); }}>
              Tạo kèo thôi! ✈
            </OrangePill>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TRIP DETAIL ────────────────────────────────────────────────────────────────
const PLACES = [
  { day: 1, name: "Thác Datanla", cat: "🏞 Thiên nhiên", cost: "80.000 ₫", note: "Đi sáng sớm tránh đông", img: UNSPLASH.dalat1 },
  { day: 1, name: "Vườn dâu Strawberry Hill", cat: "🍓 Ăn uống", cost: "120.000 ₫", note: null, img: UNSPLASH.food },
  { day: 2, name: "Cà phê The Married Beans", cat: "☕ Cà phê", cost: "65.000 ₫", note: "View đồi cực đỉnh", img: UNSPLASH.dalat2 },
  { day: 2, name: "Hồ Xuân Hương", cat: "📸 Sống ảo", cost: "Miễn phí", note: null, img: UNSPLASH.dalat1 },
  { day: 3, name: "Chợ Đà Lạt đêm", cat: "🛍 Mua sắm", cost: "200.000 ₫", note: "Mua mứt trái cây về", img: UNSPLASH.food },
];

function TripDetailPage() {
  const [tab, setTab] = useState("Lịch trình");
  const tabs = ["Lịch trình","Chi phí","Checklist","Đặt chỗ"];
  const days = [1, 2, 3];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#2B2118]">Đà Lạt hội bạn thân ✏️</h1>
          </div>
          <p className="text-[#8A7563] text-sm mt-1">📍 Đà Lạt · 14–16/08/2025 · 3N2Đ</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {DAY_COLORS.slice(0,4).map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white text-white text-xs font-bold flex items-center justify-center relative" style={{ background: c }}>
                {["A","B","C","D"][i]}
                {i === 0 && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white" />}
              </div>
            ))}
          </div>
          <CreamPill size="sm">Chia sẻ 🔗</CreamPill>
          <OrangePill size="sm">Rủ bạn +</OrangePill>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${tab === t ? "tab-active" : "tab-inactive"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Lịch trình" && (
        <div className="grid lg:grid-cols-[1fr_420px] gap-6">
          {/* Journal */}
          <div className="space-y-8">
            {days.map(day => {
              const dayPlaces = PLACES.filter(p => p.day === day);
              const color = DAY_COLORS[day - 1];
              return (
                <div key={day}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-extrabold text-lg shadow-md" style={{ background: color, boxShadow: `0 4px 16px ${color}55` }}>
                      {day}
                    </div>
                    <div>
                      <p className="font-display font-bold text-[#2B2118]">Ngày {day}</p>
                      <p className="text-[#8A7563] text-xs">{["14/08","15/08","16/08"][day-1]} · {day === 1 ? "2 chỗ" : day === 2 ? "2 chỗ" : "1 chỗ"} · {["465.000 ₫","265.000 ₫","200.000 ₫"][day-1]}</p>
                    </div>
                    <div className="ml-auto">
                      <button className="text-xs text-[#FF6B2C] font-semibold hover:underline">+ Thêm chỗ chơi</button>
                    </div>
                  </div>
                  <div className="pl-5 relative">
                    {/* Vertical dashed line */}
                    <div className="absolute left-2 top-0 bottom-0 w-0 border-l-2 border-dashed" style={{ borderColor: color }} />
                    <div className="space-y-3">
                      {dayPlaces.map((p, j) => (
                        <div key={j} className="relative flex gap-3 bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="absolute -left-7 top-4 w-5 h-5 rounded-full border-2 border-white text-white text-[9px] font-bold flex items-center justify-center z-10" style={{ background: color }}>
                            {j+1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-[#2B2118] leading-tight">{p.name}</h4>
                              <span className="text-sm font-bold text-[#FF6B2C] flex-shrink-0">{p.cost}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs bg-[#FFF3EB] text-[#8A7563] px-2 py-0.5 rounded-full">{p.cat}</span>
                            </div>
                            {p.note && (
                              <div className="mt-2 bg-[#FFC93C]/20 border-l-2 border-[#FFC93C] px-3 py-1.5 rounded-r-lg">
                                <p className="text-xs text-[#2B2118] italic">📝 {p.note}</p>
                              </div>
                            )}
                          </div>
                          <img src={p.img} alt={p.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        </div>
                      ))}
                      {/* Travel time bubble */}
                      {dayPlaces.length > 1 && (
                        <div className="flex items-center gap-2 pl-2">
                          <span className="text-xs bg-white border border-[#F3E3D3] text-[#8A7563] px-3 py-1 rounded-full">🛵 12 phút</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map panel */}
          <div className="lg:sticky lg:top-20 h-[500px] bg-[#FFF3EB] rounded-3xl border-[1.5px] border-[#F3E3D3] overflow-hidden">
            <div className="relative h-full">
              <img src={UNSPLASH.dalat2} alt="Bản đồ Đà Lạt" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-[#FFF3EB]/30" />
              {/* Pin markers */}
              {days.map(d => (
                <div
                  key={d}
                  className="absolute flex flex-col items-center cursor-pointer group"
                  style={{ top: `${[25, 45, 65][d-1]}%`, left: `${[30, 55, 70][d-1]}%` }}
                >
                  <div className="w-9 h-9 rounded-full border-3 border-white text-white font-display font-extrabold text-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ background: DAY_COLORS[d-1], borderWidth: 3 }}>
                    {d}
                  </div>
                  <div className="w-1 h-3 mt-0" style={{ background: DAY_COLORS[d-1] }} />
                </div>
              ))}
              {/* Presence indicator */}
              <div className="absolute bottom-4 left-4 bg-white rounded-2xl px-3 py-2 shadow-lg border border-[#F3E3D3] flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#FF3D77] text-white flex items-center justify-center font-bold text-[10px]">B</div>
                <span className="text-[#8A7563]">Bạn Đồng Hành đang thêm chỗ ăn 🍜</span>
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-2xl px-3 py-2 shadow-lg border border-[#F3E3D3] text-xs font-semibold text-[#2B2118]">
                🗺 Đà Lạt · 3N2Đ
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Chi phí" && <ExpensesTab />}
      {tab === "Checklist" && <ChecklistTab />}
      {tab === "Đặt chỗ" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="font-display font-bold text-xl text-[#2B2118] mb-2">Đặt chỗ & Ưu đãi</h3>
          <p className="text-[#8A7563]">Khách sạn, vé tour, di chuyển — tất cả trong một chỗ.</p>
          <OrangePill className="mt-6">Tìm chỗ ở</OrangePill>
        </div>
      )}
    </div>
  );
}

// ── EXPENSES TAB ──────────────────────────────────────────────────────────────
const EXPENSES = [
  { cat: "🍜", name: "Ăn tối phở bò", payer: "Demo", split: 2, amount: 240000, date: "14/08" },
  { cat: "🎫", name: "Vé thác Datanla", payer: "Bạn A", split: 4, amount: 320000, date: "14/08" },
  { cat: "☕", name: "Cà phê buổi sáng", payer: "Bạn B", split: 3, amount: 195000, date: "15/08" },
  { cat: "🏨", name: "Homestay 2 đêm", payer: "Demo", split: 4, amount: 2800000, date: "14/08" },
  { cat: "🛵", name: "Thuê xe máy", payer: "Bạn C", split: 2, amount: 400000, date: "14/08" },
];

function ExpensesTab() {
  const [stamped, setStamped] = useState(false);
  const total = EXPENSES.reduce((s, e) => s + e.amount, 0);
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Receipt list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-xl text-[#2B2118]">Sổ chi tiêu</h3>
          <OrangePill size="sm">+ Thêm khoản chi</OrangePill>
        </div>
        <div className="space-y-3">
          {EXPENSES.map((e, i) => (
            <div key={i} className="bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3EB] flex items-center justify-center text-xl">{e.cat}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#2B2118] text-sm">{e.name}</p>
                <p className="text-xs text-[#8A7563]">{e.payer} trả · chia {e.split} người · {e.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#2B2118]">{e.amount.toLocaleString("vi")} ₫</p>
                <p className="text-xs text-[#8A7563]">/{e.split} = {Math.round(e.amount/e.split).toLocaleString("vi")} ₫</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary sidebar */}
      <div className="space-y-4">
        {/* Total */}
        <div className="bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] p-5">
          <p className="text-sm text-[#8A7563] mb-1">Tổng đã tiêu</p>
          <p className="font-display font-extrabold text-3xl gradient-text">{total.toLocaleString("vi")} ₫</p>
          <p className="text-xs text-[#8A7563] mt-1">TB mỗi đứa: {Math.round(total/4).toLocaleString("vi")} ₫</p>
          <div className="mt-3 h-3 bg-[#FFF3EB] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: "68%", background: "linear-gradient(90deg, #FF6B2C, #FF3D77)" }} />
          </div>
          <div className="flex justify-between text-xs text-[#8A7563] mt-1">
            <span>68% của 6.000.000 ₫</span>
            <span className="text-[#FF6B2C] font-semibold">🔥</span>
          </div>
        </div>

        {/* Who owes who */}
        <div className="bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] p-5">
          <p className="font-display font-bold text-[#2B2118] mb-3">Ai nợ ai 👀</p>
          <div className="space-y-2 mb-4">
            {[
              { name: "Demo", amount: 600000, positive: true },
              { name: "Bạn Đồng Hành", amount: -600000, positive: false },
              { name: "Bạn A", amount: 200000, positive: true },
              { name: "Bạn B", amount: -200000, positive: false },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: DAY_COLORS[i] }}>
                    {p.name[0]}
                  </div>
                  <span className="text-sm text-[#2B2118]">{p.name}</span>
                </div>
                <span className={`text-sm font-bold ${p.positive ? "text-[#14B8A6]" : "text-[#E11D48]"}`}>
                  {p.positive ? "+" : ""}{p.amount.toLocaleString("vi")} ₫
                </span>
              </div>
            ))}
          </div>
          <div className="perforated pt-3">
            <p className="text-xs text-[#8A7563] mb-2">Trả gọn nhất</p>
            <div className="flex items-center justify-between bg-[#FFF3EB] rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-[#2B2118]">Bạn ĐH ➜ Demo <span className="text-[#FF6B2C]">600k</span></span>
              <button
                onClick={() => setStamped(!stamped)}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${stamped ? "bg-[#14B8A6] text-white" : "bg-white border border-[#F3E3D3] text-[#8A7563] hover:border-[#14B8A6]"}`}
              >
                {stamped ? "Đã trả ✓" : "Đánh dấu đã trả"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CHECKLIST TAB ─────────────────────────────────────────────────────────────
const TODOS = ["Đặt khách sạn ✅", "Book vé máy bay", "Đổi tiền mặt", "Tải map offline", "Mua kem chống nắng", "Check-in online", "Báo gia đình lịch trình", "Mua bảo hiểm du lịch"];
const ITEMS = ["Áo phông × 3", "Quần jeans × 2", "Áo khoác × 1", "Sandal", "Kem chống nắng SPF50", "Sạc dự phòng", "Thuốc dự phòng", "Tẩy trang", "Sổ tay du lịch"];

function ChecklistTab() {
  const [todos, setTodos] = useState(TODOS.map((t, i) => ({ text: t.replace(" ✅",""), done: i === 0 || i === 2 })));
  const [items, setItems] = useState(ITEMS.map(t => ({ text: t, done: false })));
  const allDone = todos.every(t => t.done) && items.every(t => t.done);
  const toggle = (arr: typeof todos, i: number, set: typeof setTodos) => {
    const next = [...arr]; next[i] = { ...next[i], done: !next[i].done }; set(next as any);
  };
  return (
    <div className="relative">
      {allDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-3xl px-12 py-8 shadow-2xl border-2 border-[#FF6B2C] text-center" style={{ animation: "stamp-in 0.4s ease-out forwards" }}>
            <p className="text-5xl mb-2">🎉</p>
            <p className="font-display font-extrabold text-2xl text-[#FF6B2C]">SẴN SÀNG LÊN ĐƯỜNG!</p>
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: "Việc cần làm ✅", data: todos, set: setTodos },
          { title: "Nhét vali 🎒", data: items, set: setItems },
        ].map(({ title, data, set }, ci) => {
          const done = data.filter(t => t.done).length;
          return (
            <div key={ci} className="bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] p-6 relative overflow-hidden" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #F3E3D3 27px, #F3E3D3 28px)", backgroundPositionY: "40px" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl text-[#2B2118]">{title}</h3>
                <div className="relative w-12 h-12">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#FFF3EB" strokeWidth="4" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#FF6B2C" strokeWidth="4" strokeDasharray={`${(done/data.length)*113} 113`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#FF6B2C]">{done}/{data.length}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {data.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 cursor-pointer" onClick={() => toggle(data, i, set as any)}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${item.done ? "bg-[#FF6B2C] border-[#FF6B2C]" : "border-[#F3E3D3] hover:border-[#FF6B2C]"}`}>
                      {item.done && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className={`text-sm transition-all ${item.done ? "line-through text-[#8A7563]" : "text-[#2B2118]"}`}>{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Thêm mục mới..." className="flex-1 text-sm px-3 py-2 rounded-xl border-[1.5px] border-[#F3E3D3] focus:border-[#FF6B2C] outline-none bg-white" />
                <button className="px-4 py-2 bg-[#FF6B2C] text-white text-sm font-bold rounded-xl hover:bg-[#E8551A] transition-colors">Thêm</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── EXPLORE PAGE ──────────────────────────────────────────────────────────────
const EXPLORE_CARDS = [
  { dest: "Đà Lạt", code: "DLI", dur: "3N2Đ", author: "Trang M.", likes: 234, stolen: 128, color: "#FF6B2C", img: UNSPLASH.dalat1 },
  { dest: "Hội An", code: "HOI", dur: "4N3Đ", author: "Linh T.", likes: 189, stolen: 86, color: "#FF3D77", img: UNSPLASH.hoian },
  { dest: "Hà Giang", code: "HGG", dur: "5N4Đ", author: "Nam B.", likes: 421, stolen: 214, color: "#8B5CF6", img: UNSPLASH.hagiang },
  { dest: "Phú Quốc", code: "PQC", dur: "4N3Đ", author: "Hà P.", likes: 197, stolen: 97, color: "#0EA5E9", img: UNSPLASH.phuquoc },
  { dest: "Đà Nẵng", code: "DAN", dur: "3N2Đ", author: "Khoa V.", likes: 312, stolen: 163, color: "#84CC16", img: UNSPLASH.danang },
  { dest: "Sài Gòn ẩm thực", code: "SGN", dur: "2N1Đ", author: "Minh K.", likes: 278, stolen: 141, color: "#FFC93C", img: UNSPLASH.food },
];

const DESTINATIONS = ["Đà Lạt 🌸","Hà Giang ⛰","Phú Quốc 🌊","Nhật Bản 🌸","Thái Lan 🐘","Đà Nẵng 🏖"];
const STYLES = ["🍜 Ăn sập","⛰ Trekking","👨‍👩‍👧 Gia đình","💑 Hẹn hò","🎒 Solo"];
const DURATIONS = ["2-3 ngày","4-5 ngày","1 tuần+"];

function ExplorePage({ setPage }: { setPage: (p: string) => void }) {
  const [dur, setDur] = useState("4-5 ngày");
  const [style, setStyle] = useState("🍜 Ăn sập");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero search */}
      <div className="text-center mb-10">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#2B2118] mb-6">Đi đâu chơi ta? 🧭</h1>
        <div className="max-w-xl mx-auto relative mb-5">
          <input type="text" placeholder="Nhập điểm đến hoặc loại hình du lịch..." className="w-full pl-5 pr-12 py-4 rounded-full border-2 border-[#F3E3D3] focus:border-[#FF6B2C] outline-none text-base shadow-md" />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FF6B2C] rounded-full flex items-center justify-center text-white hover:bg-[#E8551A] transition-colors">
            <MapPin size={18} />
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {DESTINATIONS.map(d => (
            <button key={d} className="px-4 py-2 bg-white border-[1.5px] border-[#F3E3D3] rounded-full text-sm font-semibold text-[#2B2118] hover:border-[#FF6B2C] hover:text-[#FF6B2C] transition-colors shadow-sm">
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {DURATIONS.map(d => (
          <button key={d} onClick={() => setDur(d)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${dur === d ? "tab-active" : "tab-inactive"}`}>{d}</button>
        ))}
        <div className="w-px h-8 bg-[#F3E3D3] self-center" />
        {STYLES.map(s => (
          <button key={s} onClick={() => setStyle(s)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${style === s ? "tab-active" : "tab-inactive"}`}>{s}</button>
        ))}
      </div>

      {/* Masonry-ish grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 mb-12">
        {EXPLORE_CARDS.map((c, i) => (
          <div key={i} className="break-inside-avoid mb-5 boarding-card group cursor-pointer hover:shadow-xl transition-all duration-300" onClick={() => setPage("auth")}>
            <div className="relative overflow-hidden" style={{ height: i % 3 === 0 ? "220px" : i % 3 === 1 ? "160px" : "200px" }}>
              <img src={c.img} alt={c.dest} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white font-display font-extrabold text-xl">{c.dest}</p>
                    <p className="text-white/70 text-xs">{c.code} · {c.dur}</p>
                  </div>
                  <Sticker color={c.color} className="text-[10px]">✈ {c.dur}</Sticker>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: c.color }}>{c.author[0]}</div>
                <span className="text-xs text-[#8A7563]">{c.author}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8A7563]">
                <span>❤ {c.likes}</span>
                <span className="text-[#FF6B2C] font-bold">😎 {c.stolen} chôm</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRICING PAGE ──────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Mê Đi có thật sự miễn phí không?", a: "Có! Tính năng cốt lõi — tạo chuyến đi, cộng tác nhóm, bản đồ, chia tiền, checklist — hoàn toàn miễn phí mãi mãi. PRO chỉ là nâng cấp thêm trải nghiệm thôi." },
  { q: "Tôi có thể hủy PRO không?", a: "Tất nhiên! Hủy bất cứ lúc nào, không câu hỏi. Tính năng PRO vẫn dùng được đến hết chu kỳ thanh toán." },
  { q: "Có thể chia sẻ PRO cho nhóm không?", a: "Hiện tại PRO là per account. Chúng mình đang phát triển gói nhóm — stay tuned nhé 👀" },
  { q: "Mê Đi kiếm tiền từ đâu nếu miễn phí?", a: "PRO subscriptions + hoa hồng nhỏ từ đặt phòng (không ảnh hưởng giá của bạn). Không quảng cáo, không bán data. Hứa đó." },
];

function PricingPage({ setPage }: { setPage: (p: string) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#2B2118] mb-3">
          Chơi lớn với Mê Đi <span className="gradient-text">PRO ✈</span>
        </h1>
        <p className="text-[#8A7563] text-lg">Cốt lõi miễn phí mãi mãi. Không giới hạn số chuyến đi & bạn bè.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto">
        {/* Free */}
        <div className="bg-[#FFF9F2] rounded-3xl border-[1.5px] border-[#F3E3D3] p-8">
          <p className="text-xs uppercase tracking-widest font-bold text-[#8A7563] mb-2">Hạng phổ thông</p>
          <div className="font-display font-extrabold text-4xl text-[#2B2118] mb-1">0 ₫</div>
          <p className="text-[#8A7563] text-sm mb-6">mãi mãi</p>
          <ul className="space-y-3 mb-8">
            {["Tạo không giới hạn chuyến đi","Cộng tác realtime","Bản đồ + lịch trình","Chia tiền thông minh","Checklist đồ đạc","Chia sẻ công khai"].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#2B2118]"><span className="text-[#14B8A6]">✓</span> {f}</li>
            ))}
          </ul>
          <CreamPill className="w-full justify-center" onClick={() => setPage("auth")}>Bắt đầu miễn phí</CreamPill>
        </div>
        {/* PRO */}
        <div className="relative bg-white rounded-3xl p-8 sunset-border" style={{ transform: "rotate(-1deg)" }}>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
            <Sticker color="#FF6B2C" rotate={-1}>🔥 Best deal — rẻ hơn 1 bữa lẩu/tháng</Sticker>
          </div>
          <p className="text-xs uppercase tracking-widest font-bold text-[#FF6B2C] mb-2 mt-4">Mê Đi PRO</p>
          <div className="mb-1">
            <span className="font-display font-extrabold text-4xl gradient-text">399.000 ₫</span>
            <span className="text-[#8A7563] text-sm">/năm</span>
          </div>
          <p className="text-xs text-[#8A7563] mb-6">≈ 33.250 ₫/tháng</p>
          <ul className="space-y-3 mb-8">
            {["Tất cả tính năng Free","Xuất Google Maps ✨","Xem offline ✨","Tối ưu lộ trình AI ✨","AI trợ lý lên kèo ✨","Đính kèm không giới hạn ✨","Quét email đặt chỗ ✨"].map(f => (
              <li key={f} className={`flex items-center gap-2 text-sm ${f.includes("✨") ? "text-[#FF6B2C] font-semibold" : "text-[#2B2118]"}`}>
                <span className={f.includes("✨") ? "text-[#FF6B2C]" : "text-[#14B8A6]"}>✓</span> {f}
              </li>
            ))}
          </ul>
          <OrangePill className="w-full justify-center mb-3" onClick={() => setPage("auth")}>Lên PRO liền 🚀</OrangePill>
          <div className="flex justify-center gap-2">
            {["💳 Visa","MoMo","VNPay","Zalo Pay"].map(m => (
              <span key={m} className="text-[9px] bg-[#FFF3EB] text-[#8A7563] px-2 py-0.5 rounded-full border border-[#F3E3D3]">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display font-bold text-2xl text-[#2B2118] mb-6 text-center">Câu hỏi thường gặp</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-semibold text-[#2B2118] text-sm">{f.q}</span>
                <ChevronDown size={16} className={`text-[#8A7563] transition-transform flex-shrink-0 ml-3 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-[#8A7563] leading-relaxed border-t border-[#F3E3D3] pt-3">{f.a}</div>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-[#8A7563] text-sm mt-8">Không quảng cáo. Không bán data. Hứa đó. 🤙</p>
      </div>
    </div>
  );
}

// ── AI PAGE ───────────────────────────────────────────────────────────────────
function AIPage({ setPage }: { setPage: (p: string) => void }) {
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const handleGenerate = () => {
    if (!input.trim()) return;
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setDone(true); }, 2500);
  };

  const statuses = ["Đang lụm quán cà phê view đồi... ☕", "Tìm homestay giá tốt... 🏠", "Xếp lịch cho hợp lý... 🗓", "Tính budget sơ bộ... 💰"];
  const [statusIdx, setStatusIdx] = useState(0);
  useEffect(() => {
    if (!generating) return;
    const id = setInterval(() => setStatusIdx(i => (i + 1) % statuses.length), 700);
    return () => clearInterval(id);
  }, [generating]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex mb-3"><Sticker color="#FF3D77">AI Trợ lý ✨</Sticker></div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#2B2118] mb-3">Trợ lý Mê Đi ✨</h1>
        <p className="text-[#8A7563] text-lg">Kể mình nghe, mình lên kèo cho</p>
      </div>

      {!done && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-3xl border-[1.5px] border-[#F3E3D3] p-6 shadow-lg">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={4}
              placeholder="Kể mình nghe chuyến đi trong mơ của bạn... Ví dụ: 3 ngày Đà Lạt, 2 đứa, 5 triệu, mê cà phê với sống ảo"
              className="w-full resize-none outline-none text-[#2B2118] placeholder:text-[#8A7563] text-base leading-relaxed"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {["3 ngày","5 triệu","Mê cà phê","Đi 2 đứa","Solo trip","Gia đình 4 người"].map(c => (
                <button key={c} onClick={() => setInput(p => p ? `${p}, ${c}` : c)} className="px-3 py-1.5 bg-[#FFF3EB] text-[#FF6B2C] text-xs font-semibold rounded-full border border-[#FFE1CF] hover:bg-[#FFE1CF] transition-colors">
                  {c}
                </button>
              ))}
            </div>
            <OrangePill className="w-full justify-center" size="lg" onClick={handleGenerate}>
              Lên kèo thôi! ✈
            </OrangePill>
          </div>
          {/* Free limit */}
          <div className="mt-4 bg-white rounded-2xl border-[1.5px] border-[#FFC93C] p-4 flex items-center gap-3">
            <span className="text-2xl">🎟</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#2B2118]">Còn 2 lượt miễn phí tháng này</p>
              <p className="text-xs text-[#8A7563]">Lên PRO để tạo thả ga không giới hạn ✨</p>
            </div>
            <OrangePill size="sm" onClick={() => setPage("pricing")}>Lên PRO</OrangePill>
          </div>
        </div>
      )}

      {generating && (
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-5xl mb-4 inline-block" style={{ animation: "plane 1s ease-in-out infinite alternate" }}>🛵</div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-[#FF6B2C]" style={{ animation: "pulse-glow 0.8s ease-in-out infinite" }} />
            <p className="text-[#8A7563] font-semibold">{statuses[statusIdx]}</p>
          </div>
        </div>
      )}

      {done && (
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-2xl text-[#2B2118]">Kèo của bạn 🎉</h2>
              <div className="flex items-center gap-2">
                <div className="bg-[#FFF3EB] rounded-xl px-3 py-1.5 text-sm font-semibold text-[#FF6B2C]">4.7tr / 5tr 😮‍💨</div>
              </div>
            </div>
            <div className="space-y-6">
              {[1,2,3].map(day => (
                <div key={day} className="bg-white rounded-2xl border-[1.5px] border-[#F3E3D3] overflow-hidden">
                  <div className="flex items-center gap-3 p-4 border-b border-[#F3E3D3]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-display font-bold text-sm" style={{ background: DAY_COLORS[day-1] }}>{day}</div>
                    <span className="font-display font-bold text-[#2B2118]">Ngày {day}</span>
                    <Sticker color={DAY_COLORS[day-1]} className="ml-auto text-[10px]">{["1.2tr","1.8tr","1.7tr"][day-1]}</Sticker>
                  </div>
                  <div className="p-4 space-y-3">
                    {[["☕ Cà phê sáng","50k"],["🌸 Tham quan","80k"],["🍜 Ăn trưa","120k"]].map(([name, cost]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="text-[#2B2118]">{name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#8A7563]">{cost}</span>
                          <button className="text-[#8A7563] hover:text-[#FF6B2C] text-xs">🔄</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <OrangePill onClick={() => setPage("trip")}>Lưu thành kèo ✈</OrangePill>
              <CreamPill onClick={() => { setDone(false); setInput(""); }}>Tạo kèo mới</CreamPill>
            </div>
          </div>
          {/* Mini map */}
          <div className="bg-[#FFF3EB] rounded-3xl overflow-hidden border-[1.5px] border-[#F3E3D3] h-80 lg:h-auto relative">
            <img src={UNSPLASH.dalat2} alt="Bản đồ" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-2">🗺</p>
                <p className="font-display font-bold text-[#2B2118]">Đà Lạt</p>
                <p className="text-xs text-[#8A7563]">7 địa điểm · 3 ngày</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");

  const showFooter = ["landing","explore","pricing"].includes(page);
  const fullscreen = page === "auth";

  return (
    <div className="min-h-screen bg-[#FFF9F2]">
      <GlobalStyles />
      {!fullscreen && <Nav activePage={page} setPage={setPage} />}
      <main>
        {page === "landing" && <LandingPage setPage={setPage} />}
        {page === "auth" && <AuthPage setPage={setPage} />}
        {page === "dashboard" && <DashboardPage setPage={setPage} />}
        {page === "trip" && <TripDetailPage />}
        {page === "explore" && <ExplorePage setPage={setPage} />}
        {page === "pricing" && <PricingPage setPage={setPage} />}
        {page === "ai" && <AIPage setPage={setPage} />}
      </main>
      {showFooter && <Footer setPage={setPage} />}
    </div>
  );
}
