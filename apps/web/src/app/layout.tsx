import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Baloo_2 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

const baloo2 = Baloo_2({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo-2",
});

export const metadata: Metadata = {
  title: "Mê Đi – Lên kế hoạch du lịch cùng nhau",
  description:
    "Mê Đi (medi) giúp bạn lập lịch trình, xem bản đồ, chia chi phí và lên kế hoạch du lịch cùng bạn bè theo thời gian thực.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.svg" },
  appleWebApp: { capable: true, title: "Mê Đi", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#FF6B2C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${baloo2.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
