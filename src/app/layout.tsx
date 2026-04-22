import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { Footer } from "@/components/layout/footer";
import { GA_TRACKING_ID } from "@/lib/gtag";
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
  const hasGaId = GA_TRACKING_ID.length > 0;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {hasGaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = window.gtag || gtag;
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', { send_page_view: false });
              `}
            </Script>
            <GoogleAnalytics />
          </>
        ) : null}
        {children}
        <Footer />
      </body>
    </html>
  );
}
