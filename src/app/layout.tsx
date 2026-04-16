import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kompass-rosy.vercel.app"),
  title: {
    default: "Kompass｜あなたに合うAIを診断する",
    template: "%s | Kompass",
  },
  description:
    "ChatGPT・Claude・Gemini・Perplexity・Copilotの中から、あなたの思考スタイルに最適なAIを40問で診断。無料・登録不要。",
  keywords: [
    "AI診断",
    "ChatGPT",
    "Claude",
    "Gemini",
    "Perplexity",
    "Copilot",
    "AI活用",
    "AIツール",
  ],
  openGraph: {
    siteName: "Kompass",
    type: "website",
    locale: "ja_JP",
  },
  verification: {
    google: "Wj8szl_41S2XtuBpkRt6gZ0utpFkuxBUuVLYlfKwPys",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
